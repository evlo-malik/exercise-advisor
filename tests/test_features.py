import numpy as np
import pytest

from exercise_advisor.config import Config
from exercise_advisor.features import (
    build_feature_vector,
    compute_angles,
    compute_velocity,
    fill_nan_frames,
    interpolate_sequence,
    normalize_pose,
)
from exercise_advisor.pose.landmarks import IDX


def test_feature_dim_matches_config(landmarks):
    for use_angles, use_velocity in [(True, True), (True, False), (False, True), (False, False)]:
        cfg = Config(use_angles=use_angles, use_velocity=use_velocity)
        feats = build_feature_vector(landmarks, use_angles, use_velocity)
        assert feats.shape == (landmarks.shape[0], cfg.feature_dim)
        assert feats.dtype == np.float32
    assert Config().feature_dim == 222


def test_normalize_pose_is_hip_centred_and_shoulder_scaled(landmarks):
    normed = normalize_pose(landmarks)
    hip_mid = (normed[:, IDX["left_hip"]] + normed[:, IDX["right_hip"]]) / 2
    assert np.allclose(hip_mid, 0.0, atol=1e-5)
    shoulder = np.linalg.norm(
        normed[:, IDX["left_shoulder"]] - normed[:, IDX["right_shoulder"]], axis=1
    )
    assert np.allclose(shoulder, 1.0, atol=1e-4)


def test_normalize_pose_is_translation_and_scale_invariant(landmarks):
    shifted = landmarks * 3.0 + np.array([0.7, -0.2, 0.1], dtype=np.float32)
    assert np.allclose(normalize_pose(landmarks), normalize_pose(shifted), atol=1e-4)


def test_compute_angles_right_angle():
    lm = np.zeros((1, 33, 3), dtype=np.float32)
    lm[0, IDX["left_shoulder"]] = [0, 1, 0]
    lm[0, IDX["left_elbow"]] = [0, 0, 0]
    lm[0, IDX["left_wrist"]] = [1, 0, 0]
    angles = compute_angles(lm)
    assert angles.shape == (1, 12)
    assert angles[0, 0] == pytest.approx(90.0, abs=1e-3)


def test_compute_angles_nan_gives_zero():
    lm = np.full((2, 33, 3), np.nan, dtype=np.float32)
    assert np.all(compute_angles(lm) == 0)


def test_compute_velocity_first_frame_zero():
    feats = np.arange(12, dtype=np.float32).reshape(4, 3)
    vel = compute_velocity(feats)
    assert np.all(vel[0] == 0)
    assert np.all(vel[1:] == 3)


def test_fill_nan_frames_interpolates():
    lm = np.ones((5, 33, 3), dtype=np.float32)
    lm[4] = 5.0
    lm[1:4] = np.nan
    filled = fill_nan_frames(lm)
    assert not np.isnan(filled).any()
    assert np.allclose(filled[2, 0, 0], 3.0)


def test_fill_nan_frames_all_missing_returns_zeros():
    lm = np.full((3, 33, 3), np.nan, dtype=np.float32)
    assert np.all(fill_nan_frames(lm) == 0)


@pytest.mark.parametrize("n_frames", [1, 17, 100, 250])
def test_interpolate_sequence_lengths(n_frames):
    feats = np.random.rand(n_frames, 7).astype(np.float32)
    out = interpolate_sequence(feats, 100)
    assert out.shape == (100, 7)
    assert np.allclose(out[0], feats[0])
    assert np.allclose(out[-1], feats[-1])


def test_build_feature_vector_rejects_bad_shape():
    with pytest.raises(ValueError):
        build_feature_vector(np.zeros((10, 17, 3), dtype=np.float32))
