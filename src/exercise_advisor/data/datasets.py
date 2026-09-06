"""PyTorch datasets that read cached landmark ``.npy`` files and build features on the fly."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

import numpy as np
import torch
from torch.utils.data import DataLoader, Dataset

from exercise_advisor.data.augmentation import augment_landmarks
from exercise_advisor.data.labels import RepLabel
from exercise_advisor.features import build_feature_vector, interpolate_sequence

log = logging.getLogger(__name__)


class PoseDataset(Dataset):
    """Multi-label dataset over one exercise.

    Each item is a dict with ``X`` ``(fixed_len, F)``, ``y_errors`` ``(n_classes,)``,
    ``y_score`` and ``rep_key``. Keys without a cached pose file are skipped.
    """

    def __init__(
        self,
        rep_keys: list[str],
        labels: dict[str, RepLabel],
        pose_dir: Path | str,
        fixed_len: int = 100,
        use_angles: bool = True,
        use_velocity: bool = True,
        augment: bool = False,
        seed: int = 42,
    ) -> None:
        self.pose_dir = Path(pose_dir)
        self.labels = labels
        self.fixed_len = fixed_len
        self.use_angles = use_angles
        self.use_velocity = use_velocity
        self.augment = augment
        self.rng = np.random.default_rng(seed)

        self.keys = [k for k in rep_keys if k in labels and (self.pose_dir / f"{k}.npy").exists()]
        skipped = len(rep_keys) - len(self.keys)
        if skipped:
            log.info("%s: %d keys without a pose file were skipped", self.pose_dir, skipped)

    def __len__(self) -> int:
        return len(self.keys)

    def _features(self, rep_key: str) -> torch.Tensor:
        landmarks = np.load(self.pose_dir / f"{rep_key}.npy")
        if self.augment:
            landmarks = augment_landmarks(landmarks, self.rng)
        feats = build_feature_vector(landmarks, self.use_angles, self.use_velocity)
        return torch.from_numpy(interpolate_sequence(feats, self.fixed_len))

    def __getitem__(self, idx: int) -> dict[str, Any]:
        rep_key = self.keys[idx]
        label = self.labels[rep_key]
        return {
            "X": self._features(rep_key),
            "y_errors": torch.from_numpy(label.multihot),
            "y_score": torch.tensor(label.score, dtype=torch.float32),
            "rep_key": rep_key,
        }


class BinaryPoseDataset(PoseDataset):
    """Dataset for a single error class.

    With ``balance=True`` (training) the minority class is oversampled by index
    repetition until the classes are 1:1; combined with augmentation every repeat of
    a rep looks different. Validation / test use ``balance=False``.
    """

    def __init__(
        self,
        rep_keys: list[str],
        labels: dict[str, RepLabel],
        pose_dir: Path | str,
        target_class_idx: int,
        balance: bool = False,
        **kwargs: Any,
    ) -> None:
        super().__init__(rep_keys, labels, pose_dir, **kwargs)
        self.target_class_idx = target_class_idx
        if balance:
            self.keys = self._balanced_keys(self.keys)

    def _balanced_keys(self, keys: list[str]) -> list[str]:
        pos = [k for k in keys if self.labels[k].multihot[self.target_class_idx] == 1]
        neg = [k for k in keys if self.labels[k].multihot[self.target_class_idx] == 0]
        if 0 < len(pos) < len(neg):
            pos = (pos * (len(neg) // len(pos) + 1))[: len(neg)]
        elif 0 < len(neg) < len(pos):
            neg = (neg * (len(pos) // len(neg) + 1))[: len(pos)]
        log.info("class %d balanced: %d neg + %d pos", self.target_class_idx, len(neg), len(pos))
        return neg + pos

    def __getitem__(self, idx: int) -> dict[str, Any]:
        item = super().__getitem__(idx)
        item["y_binary"] = item["y_errors"][self.target_class_idx].clone()
        return item


def recommended_num_workers() -> int:
    """More workers on CUDA machines; ``0`` on CPU-only boxes for stability."""
    if not torch.cuda.is_available():
        return 0
    return min(8, os.cpu_count() or 2)


def _loader_kwargs(is_train: bool, batch_size: int, num_workers: int | None) -> dict[str, Any]:
    workers = recommended_num_workers() if num_workers is None else num_workers
    kwargs: dict[str, Any] = {
        "batch_size": batch_size,
        "shuffle": is_train,
        "num_workers": workers,
        "pin_memory": torch.cuda.is_available(),
        "persistent_workers": workers > 0,
    }
    if workers > 0:
        kwargs["prefetch_factor"] = 2
    return kwargs


def make_dataloader(
    split: str,
    rep_keys: list[str],
    labels: dict[str, RepLabel],
    pose_dir: Path | str,
    batch_size: int = 64,
    num_workers: int | None = None,
    **dataset_kwargs: Any,
) -> DataLoader:
    """Multi-label loader (no balancing); augmentation only for ``split == "train"``."""
    is_train = split == "train"
    ds = PoseDataset(rep_keys, labels, pose_dir, augment=is_train, **dataset_kwargs)
    return DataLoader(ds, drop_last=False, **_loader_kwargs(is_train, batch_size, num_workers))


def make_binary_dataloader(
    split: str,
    rep_keys: list[str],
    labels: dict[str, RepLabel],
    pose_dir: Path | str,
    target_class_idx: int,
    batch_size: int = 32,
    num_workers: int | None = None,
    **dataset_kwargs: Any,
) -> DataLoader:
    """Per-class loader: balanced + augmented for train, untouched for val / test."""
    is_train = split == "train"
    ds = BinaryPoseDataset(
        rep_keys,
        labels,
        pose_dir,
        target_class_idx=target_class_idx,
        balance=is_train,
        augment=is_train,
        **dataset_kwargs,
    )
    return DataLoader(
        ds,
        drop_last=is_train and len(ds) > batch_size,
        **_loader_kwargs(is_train, batch_size, num_workers),
    )
