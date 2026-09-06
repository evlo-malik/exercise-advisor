"""Configuration objects: model/training hyper-parameters and filesystem layout."""

from __future__ import annotations

import os
import random
from dataclasses import asdict, dataclass, field, fields
from pathlib import Path
from typing import Any

import numpy as np

N_LANDMARKS = 33
N_COORDS = 3
N_ANGLES = 12


@dataclass(frozen=True)
class Config:
    """Hyper-parameters for feature construction, the TCN and training.

    The defaults reproduce the shipped checkpoints:
    ``hidden_dim=128, n_layers=6, dropout=0.3, lr=3e-4, weight_decay=5e-4``.
    """

    # Features
    fixed_len: int = 100
    use_angles: bool = True
    use_velocity: bool = True

    # Model
    hidden_dim: int = 128
    n_layers: int = 6
    kernel_size: int = 3
    dropout: float = 0.3

    # Optimisation
    batch_size: int = 32
    lr: float = 3e-4
    weight_decay: float = 5e-4
    max_epochs: int = 200
    patience: int = 30
    grad_clip: float = 1.0
    scheduler_patience: int = 5
    scheduler_factor: float = 0.5

    # Threshold tuning on the validation set
    precision_floor: float = 0.20

    seed: int = 42

    @property
    def feature_dim(self) -> int:
        """Features per frame: 99 coords (+12 angles) (x2 with velocities) -> 222 by default."""
        base = N_LANDMARKS * N_COORDS
        base += N_ANGLES if self.use_angles else 0
        return base * 2 if self.use_velocity else base

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Config:
        """Build a Config from a dict, ignoring unknown keys (forward/backward compatible)."""
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in known})


@dataclass
class Paths:
    """Filesystem layout. Every entry can be overridden with an environment variable.

    ``FITNESS_AQA_ROOT``              root of the Fitness-AQA dataset release
    ``EXERCISE_ADVISOR_POSES``        cached ``(T, 33, 3)`` landmark ``.npy`` files
    ``EXERCISE_ADVISOR_CHECKPOINTS``  trained model checkpoints
    ``EXERCISE_ADVISOR_OUTPUTS``      plots, metrics and other artefacts
    """

    dataset_root: Path = field(
        default_factory=lambda: Path(
            os.environ.get("FITNESS_AQA_ROOT", "data/Fitness-AQA_dataset_release")
        )
    )
    pose_root: Path = field(
        default_factory=lambda: Path(os.environ.get("EXERCISE_ADVISOR_POSES", "data/poses"))
    )
    checkpoint_dir: Path = field(
        default_factory=lambda: Path(os.environ.get("EXERCISE_ADVISOR_CHECKPOINTS", "checkpoints"))
    )
    output_dir: Path = field(
        default_factory=lambda: Path(os.environ.get("EXERCISE_ADVISOR_OUTPUTS", "outputs"))
    )

    def video_dir(self, exercise: str) -> Path:
        return self.dataset_root / exercise / "Labeled_Dataset" / "videos"

    @property
    def barbell_images_dir(self) -> Path:
        return self.dataset_root / "BarbellRow" / "Labeled_Dataset" / "barbellrow_images_raw"

    def pose_dir(self, exercise: str) -> Path:
        return self.pose_root / exercise


def seed_everything(seed: int = 42) -> None:
    """Seed Python, NumPy and (if available) PyTorch for reproducible runs."""
    random.seed(seed)
    np.random.seed(seed)
    try:
        import torch

        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
    except ImportError:  # pragma: no cover - torch is a hard dependency, kept defensive
        pass
