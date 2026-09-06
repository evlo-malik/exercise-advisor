"""Landmark-space augmentation applied to training samples before feature building."""

from __future__ import annotations

import numpy as np
from scipy.interpolate import interp1d

from exercise_advisor.pose.landmarks import LR_SWAP_PAIRS


def augment_landmarks(landmarks: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Randomly perturb a ``(T, 33, 3)`` landmark sequence.

    Each augmentation is gated by its own probability:

    1. temporal jitter  (p=0.8): stretch / compress duration by +-20 %
    2. gaussian noise   (p=0.5): sigma = 0.01 on every coordinate
    3. horizontal flip  (p=0.5): mirror x and swap left / right landmark indices
    4. scale jitter     (p=0.5): global scale in U(0.85, 1.15)
    5. y-axis rotation  (p=0.4): rotate x / z by +-15 degrees (camera yaw)
    6. landmark dropout (p=0.3): zero out 1-4 whole landmarks
    """
    aug = np.asarray(landmarks, dtype=np.float32).copy()
    n_frames = aug.shape[0]

    if rng.random() < 0.8 and n_frames > 1:
        factor = rng.uniform(0.8, 1.2)
        new_len = max(int(n_frames * factor), 10)
        src_t = np.linspace(0.0, 1.0, n_frames)
        dst_t = np.linspace(0.0, 1.0, new_len)
        fn = interp1d(src_t, aug.reshape(n_frames, -1), axis=0, kind="linear")
        aug = np.asarray(fn(dst_t), dtype=np.float32).reshape(new_len, 33, 3)

    if rng.random() < 0.5:
        aug += np.asarray(rng.normal(0.0, 0.01, size=aug.shape), dtype=np.float32)

    if rng.random() < 0.5:
        aug[:, :, 0] *= -1
        for left, right in LR_SWAP_PAIRS:
            aug[:, [left, right], :] = aug[:, [right, left], :]

    if rng.random() < 0.5:
        aug *= rng.uniform(0.85, 1.15)

    if rng.random() < 0.4:
        angle = np.deg2rad(rng.uniform(-15.0, 15.0))
        cos_a, sin_a = np.cos(angle), np.sin(angle)
        x, z = aug[:, :, 0].copy(), aug[:, :, 2].copy()
        aug[:, :, 0] = cos_a * x - sin_a * z
        aug[:, :, 2] = sin_a * x + cos_a * z

    if rng.random() < 0.3:
        n_drop = int(rng.integers(1, 5))
        drop_idx = rng.choice(33, size=n_drop, replace=False)
        aug[:, drop_idx, :] = 0.0

    return aug
