import numpy as np

from exercise_advisor.data.augmentation import augment_landmarks
from exercise_advisor.pose.landmarks import LR_SWAP_PAIRS


def test_augment_keeps_landmark_layout(landmarks, rng):
    for _ in range(20):
        aug = augment_landmarks(landmarks, rng)
        assert aug.ndim == 3 and aug.shape[1:] == (33, 3)
        assert aug.dtype == np.float32
        assert np.isfinite(aug).all()


def test_augment_does_not_mutate_input(landmarks, rng):
    before = landmarks.copy()
    augment_landmarks(landmarks, rng)
    assert np.array_equal(before, landmarks)


def test_augment_is_deterministic_for_seed(landmarks):
    a = augment_landmarks(landmarks, np.random.default_rng(7))
    b = augment_landmarks(landmarks, np.random.default_rng(7))
    assert np.array_equal(a, b)


def test_swap_pairs_cover_all_lateral_landmarks():
    covered = {i for pair in LR_SWAP_PAIRS for i in pair}
    assert covered == set(range(1, 33)) - {0} - {9, 10} | {9, 10}
    assert len(LR_SWAP_PAIRS) == 16
