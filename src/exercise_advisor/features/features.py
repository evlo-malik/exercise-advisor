"""Turn raw ``(T, 33, 3)`` landmarks into a fixed-length ``(fixed_len, F)`` feature sequence.

Pipeline: ``fill_nan_frames`` -> ``normalize_pose`` -> flatten -> ``compute_angles``
-> ``compute_velocity`` -> ``interpolate_sequence``.

With angles and velocities enabled ``F = (99 + 12) * 2 = 222``.
"""

from __future__ import annotations

import numpy as np
from scipy.interpolate import interp1d

from exercise_advisor.pose.landmarks import ANGLE_TRIPLETS, IDX

_EPS = 1e-8


def fill_nan_frames(landmarks: np.ndarray) -> np.ndarray:
    """Linearly interpolate frames where the pose detector failed (NaN landmarks).

    Returns an all-zero array if every frame is missing, and the input unchanged
    (as float32) if nothing is missing.
    """
    lm = np.asarray(landmarks, dtype=np.float32)
    n_frames = lm.shape[0]
    flat = lm.reshape(n_frames, -1).copy()
    nan_rows = np.isnan(flat).any(axis=1)

    if nan_rows.all():
        return np.zeros_like(lm)
    if not nan_rows.any():
        return lm

    frame_idx = np.arange(n_frames)
    for col in range(flat.shape[1]):
        column = flat[:, col]
        mask = np.isnan(column)
        if mask.any():
            valid = ~mask
            flat[:, col] = np.interp(frame_idx, frame_idx[valid], column[valid])
    return flat.reshape(lm.shape).astype(np.float32)


def normalize_pose(landmarks: np.ndarray) -> np.ndarray:
    """Centre each frame on the hip midpoint and scale by shoulder width.

    This removes translation (where the person stands) and scale (camera distance,
    body size), leaving only the geometry of the movement.
    """
    lm = np.asarray(landmarks, dtype=np.float32).copy()
    hip_mid = (lm[:, IDX["left_hip"], :] + lm[:, IDX["right_hip"], :]) / 2.0
    lm -= hip_mid[:, None, :]

    shoulder_width = np.linalg.norm(
        lm[:, IDX["left_shoulder"], :] - lm[:, IDX["right_shoulder"], :], axis=1, keepdims=True
    )
    shoulder_width = np.where(shoulder_width < 1e-6, 1.0, shoulder_width)
    lm /= shoulder_width[:, None, :]
    return lm.astype(np.float32)


def _angle_at_vertex(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> np.ndarray:
    """Angle (degrees) at ``b`` for the triplets ``a-b-c``; vectorised over the first axis."""
    v1 = a - b
    v2 = c - b
    cos_theta = (v1 * v2).sum(axis=-1) / (
        np.linalg.norm(v1, axis=-1) * np.linalg.norm(v2, axis=-1) + _EPS
    )
    return np.degrees(np.arccos(np.clip(cos_theta, -1.0, 1.0)))


def compute_angles(landmarks: np.ndarray) -> np.ndarray:
    """Twelve joint angles per frame (elbows, shoulders, hips, knees, ankles, wrists).

    Frames with a NaN in any of the three points of a triplet yield ``0`` for that angle.
    """
    lm = np.asarray(landmarks, dtype=np.float32)
    n_frames = lm.shape[0]
    angles = np.zeros((n_frames, len(ANGLE_TRIPLETS)), dtype=np.float32)
    for j, (joint, proximal, distal) in enumerate(ANGLE_TRIPLETS):
        a, b, c = lm[:, IDX[proximal]], lm[:, IDX[joint]], lm[:, IDX[distal]]
        valid = ~(np.isnan(a).any(1) | np.isnan(b).any(1) | np.isnan(c).any(1))
        if valid.any():
            angles[valid, j] = _angle_at_vertex(a[valid], b[valid], c[valid])
    return angles


def compute_velocity(features: np.ndarray) -> np.ndarray:
    """First-order temporal difference; the first frame has zero velocity."""
    vel = np.zeros_like(features, dtype=np.float32)
    vel[1:] = features[1:] - features[:-1]
    return vel


def build_feature_vector(
    landmarks: np.ndarray,
    use_angles: bool = True,
    use_velocity: bool = True,
) -> np.ndarray:
    """Full per-frame feature pipeline for a ``(T, 33, 3)`` landmark array -> ``(T, F)``."""
    lm = np.asarray(landmarks, dtype=np.float32)
    if lm.ndim != 3 or lm.shape[1:] != (33, 3):
        raise ValueError(f"expected landmarks of shape (T, 33, 3), got {lm.shape}")

    lm = normalize_pose(fill_nan_frames(lm))
    feat = lm.reshape(lm.shape[0], -1)
    if use_angles:
        feat = np.concatenate([feat, compute_angles(lm)], axis=1)
    if use_velocity:
        feat = np.concatenate([feat, compute_velocity(feat)], axis=1)
    return feat.astype(np.float32)


def interpolate_sequence(features: np.ndarray, target_len: int = 100) -> np.ndarray:
    """Resample a ``(T, F)`` sequence to ``(target_len, F)`` with linear interpolation.

    A single-frame input is repeated ``target_len`` times.
    """
    feats = np.asarray(features, dtype=np.float32)
    n_frames = feats.shape[0]
    if n_frames == target_len:
        return feats
    if n_frames == 1:
        return np.repeat(feats, target_len, axis=0)

    src_t = np.linspace(0.0, 1.0, n_frames)
    dst_t = np.linspace(0.0, 1.0, target_len)
    fn = interp1d(src_t, feats, axis=0, kind="linear", fill_value="extrapolate")
    return fn(dst_t).astype(np.float32)
