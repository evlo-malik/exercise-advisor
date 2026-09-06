"""Labels, subject-aware splits and PyTorch datasets."""

from exercise_advisor.data.augmentation import augment_landmarks
from exercise_advisor.data.datasets import (
    BinaryPoseDataset,
    PoseDataset,
    make_binary_dataloader,
    make_dataloader,
)
from exercise_advisor.data.labels import (
    EXERCISES,
    ExerciseSpec,
    RepLabel,
    error_names,
    load_exercise_labels,
    load_splits,
)
from exercise_advisor.data.splits import build_subject_split, verify_subject_splits

__all__ = [
    "EXERCISES",
    "BinaryPoseDataset",
    "ExerciseSpec",
    "PoseDataset",
    "RepLabel",
    "augment_landmarks",
    "build_subject_split",
    "error_names",
    "load_exercise_labels",
    "load_splits",
    "make_binary_dataloader",
    "make_dataloader",
    "verify_subject_splits",
]
