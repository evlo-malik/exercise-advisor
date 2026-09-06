"""Shared fixtures: a tiny synthetic Fitness-AQA release with cached poses."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pytest

from exercise_advisor.config import Config, Paths
from exercise_advisor.data.labels import EXERCISES


def _write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data))


def _random_landmarks(rng: np.random.Generator, n_frames: int) -> np.ndarray:
    """Plausible landmarks: hips near (0.5, 0.6), shoulders above, in [0, 1] image space."""
    base = rng.uniform(0.2, 0.8, size=(33, 3)).astype(np.float32)
    base[23] = [0.45, 0.60, 0.0]  # left hip
    base[24] = [0.55, 0.60, 0.0]  # right hip
    base[11] = [0.40, 0.35, 0.0]  # left shoulder
    base[12] = [0.60, 0.35, 0.0]  # right shoulder
    drift = rng.normal(0, 0.01, size=(n_frames, 33, 3)).astype(np.float32)
    return base[None] + np.cumsum(drift, axis=0)


@pytest.fixture(scope="session")
def synthetic_dataset(tmp_path_factory: pytest.TempPathFactory) -> Paths:
    """Labels, splits and pose ``.npy`` files for all three exercises (subject-disjoint)."""
    root = tmp_path_factory.mktemp("fitness_aqa")
    paths = Paths(
        dataset_root=root / "release",
        pose_root=root / "poses",
        checkpoint_dir=root / "checkpoints",
        output_dir=root / "outputs",
    )
    rng = np.random.default_rng(0)

    for exercise, spec in EXERCISES.items():
        # 12 subjects x 3 reps; subjects 0-7 train, 8-9 val, 10-11 test
        keys_by_split: dict[str, list[str]] = {"train": [], "val": [], "test": []}
        per_error: dict[str, dict[str, object]] = {name: {} for name in spec.error_names}
        for subject in range(12):
            split = "train" if subject < 8 else "val" if subject < 10 else "test"
            for rep in range(3):
                key = (
                    f"{1000 + subject}_{rep}"
                    if spec.key_format == "subject_rep"
                    else (f"{1000 + subject}_{rep}_{rep + 1}")
                )
                keys_by_split[split].append(key)
                for name, (_, fmt) in spec.label_files.items():
                    flag = bool(rng.random() < 0.4)
                    if fmt == "interval":
                        per_error[name][key] = [[0.5, 2.5]] if flag else []
                    elif fmt == "binary":
                        per_error[name][key] = int(flag)
                    else:  # frame_binary: three frames per rep
                        for frame in range(3):
                            per_error[name][f"{key}_{frame}"] = int(flag and frame == 1)
                n_frames = 1 if exercise == "BarbellRow" else int(rng.integers(40, 90))
                pose_path = paths.pose_dir(exercise) / f"{key}.npy"
                pose_path.parent.mkdir(parents=True, exist_ok=True)
                np.save(pose_path, _random_landmarks(rng, n_frames))

        for name, (rel_path, _) in spec.label_files.items():
            _write_json(paths.dataset_root / rel_path, per_error[name])
        for split, rel_path in spec.splits.items():
            _write_json(paths.dataset_root / rel_path, keys_by_split[split])
    return paths


@pytest.fixture
def tiny_config() -> Config:
    return Config(hidden_dim=8, n_layers=2, batch_size=4, max_epochs=2, patience=5, seed=0)


@pytest.fixture
def rng() -> np.random.Generator:
    return np.random.default_rng(123)


@pytest.fixture
def landmarks(rng: np.random.Generator) -> np.ndarray:
    return _random_landmarks(rng, 60)
