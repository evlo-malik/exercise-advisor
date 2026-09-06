"""Fitness-AQA label loading and quality-score derivation.

Three label formats appear in the dataset release:

``interval``      ``[[t_start, t_end], ...]`` seconds where the error is present
                  (OHP elbows/knees, Squat knees inward/forward). Empty list = clean.
``binary``        ``0`` / ``1`` per rep (BarbellRow lumbar / torso angle).
``frame_binary``  ``0`` / ``1`` per *frame* with ``subject_rep_frame`` keys
                  (Squat shallow depth). Aggregated to rep level: any frame = 1 -> rep = 1.

Rep keys are ``{subject}_{rep}`` (OHP, Squat) or ``{subject}_{session}_{rep}`` (BarbellRow);
the subject id is always the first underscore-delimited token.
"""

from __future__ import annotations

import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

import numpy as np

LabelFormat = Literal["interval", "binary", "frame_binary"]


@dataclass(frozen=True)
class ExerciseSpec:
    """Where an exercise's labels and official splits live inside the dataset release."""

    name: str
    label_files: dict[str, tuple[str, LabelFormat]]
    splits: dict[str, str]
    key_format: str

    @property
    def error_names(self) -> list[str]:
        return list(self.label_files)

    def label_format(self, error_name: str) -> LabelFormat:
        return self.label_files[error_name][1]


EXERCISES: dict[str, ExerciseSpec] = {
    "OHP": ExerciseSpec(
        name="OHP",
        label_files={
            "error_elbows": ("OHP/Labeled_Dataset/Labels/error_elbows.json", "interval"),
            "error_knees": ("OHP/Labeled_Dataset/Labels/error_knees.json", "interval"),
        },
        splits={
            "train": "OHP/Labeled_Dataset/Splits/train_keys.json",
            "val": "OHP/Labeled_Dataset/Splits/val_keys.json",
            "test": "OHP/Labeled_Dataset/Splits/test_keys.json",
        },
        key_format="subject_rep",
    ),
    "Squat": ExerciseSpec(
        name="Squat",
        label_files={
            "knees_inward": ("Squat/Labeled_Dataset/Labels/error_knees_inward.json", "interval"),
            "knees_forward": ("Squat/Labeled_Dataset/Labels/error_knees_forward.json", "interval"),
            "shallow_depth": (
                "Squat/Labeled_Dataset/Shallow_Squat_Error_Dataset/labels_shallow_depth.json",
                "frame_binary",
            ),
        },
        splits={
            "train": "Squat/Labeled_Dataset/Splits/train_keys.json",
            "val": "Squat/Labeled_Dataset/Splits/val_keys.json",
            "test": "Squat/Labeled_Dataset/Splits/test_keys.json",
        },
        key_format="subject_rep",
    ),
    "BarbellRow": ExerciseSpec(
        name="BarbellRow",
        label_files={
            "lumbar_error": (
                "BarbellRow/Labeled_Dataset/Labels/labels_lumbar_error.json",
                "binary",
            ),
            "torso_angle": (
                "BarbellRow/Labeled_Dataset/Labels/labels_torso_angle_error.json",
                "binary",
            ),
        },
        # The lumbar split covers every labelled rep, so it is used as the primary split.
        splits={
            "train": "BarbellRow/Labeled_Dataset/Splits/Splits_Lumbar_Error/train_ids.json",
            "val": "BarbellRow/Labeled_Dataset/Splits/Splits_Lumbar_Error/val_ids.json",
            "test": "BarbellRow/Labeled_Dataset/Splits/Splits_Lumbar_Error/test_ids.json",
        },
        key_format="subject_session_rep",
    ),
}

EXERCISE_NAMES: tuple[str, ...] = tuple(EXERCISES)


def error_names(exercise: str) -> list[str]:
    """Ordered error-class names for an exercise (the multi-hot column order)."""
    return EXERCISES[exercise].error_names


@dataclass
class RepLabel:
    """Ground truth for a single repetition."""

    rep_key: str
    subject_id: str
    exercise: str
    errors: list[str]
    raw: dict[str, object]
    score: float
    multihot: np.ndarray

    def __repr__(self) -> str:  # pragma: no cover - cosmetic
        return f"RepLabel(key={self.rep_key}, score={self.score:.2f}, errors={self.errors})"


def extract_subject_id(rep_key: str) -> str:
    """``"46777_3"`` -> ``"46777"``; ``"56067_3_51"`` -> ``"56067"``."""
    return rep_key.split("_")[0]


def intervals_to_score(intervals: dict[str, object], clip_duration_s: float = 8.0) -> float:
    """``1 - clamp(total error seconds / clip duration, 0, 1)`` over interval-format labels."""
    total_error = 0.0
    for value in intervals.values():
        if isinstance(value, list):
            for segment in value:
                if isinstance(segment, list) and len(segment) == 2:
                    total_error += max(0.0, float(segment[1]) - float(segment[0]))
    return float(np.clip(1.0 - total_error / clip_duration_s, 0.0, 1.0))


def _aggregate_frame_labels(frame_labels: dict[str, int]) -> dict[str, int]:
    """Collapse ``subject_rep_frame -> 0/1`` into ``subject_rep -> 0/1`` (any frame flagged)."""
    per_rep: dict[str, list[int]] = defaultdict(list)
    for key, value in frame_labels.items():
        parts = key.split("_")
        per_rep[f"{parts[0]}_{parts[1]}"].append(int(value))
    return {rep: int(any(v == 1 for v in values)) for rep, values in per_rep.items()}


def derive_score(spec: ExerciseSpec, raw: dict[str, object], multihot: np.ndarray) -> float:
    """Quality score in [0, 1] from raw labels.

    * Interval exercises: duration-based score, further penalised by any binary errors.
    * All-binary exercises: fraction of error classes that are clean.
    """
    interval_names = [e for e in spec.error_names if spec.label_format(e) == "interval"]
    binary_names = [e for e in spec.error_names if spec.label_format(e) != "interval"]

    if not interval_names:
        return float(1.0 - multihot.mean())

    score = intervals_to_score({e: raw[e] for e in interval_names})
    if binary_names:
        n_binary_errors = sum(1 for e in binary_names if raw[e])
        score *= 1.0 - 0.5 * n_binary_errors / len(binary_names)
    return float(score)


def load_exercise_labels(exercise: str, dataset_root: Path | str) -> dict[str, RepLabel]:
    """Load every labelled rep for ``exercise`` as ``{rep_key: RepLabel}``."""
    spec = EXERCISES[exercise]
    root = Path(dataset_root)

    per_error: dict[str, dict[str, object]] = {}
    all_keys: set[str] = set()
    for name, (rel_path, fmt) in spec.label_files.items():
        with open(root / rel_path) as fh:
            data = json.load(fh)
        if fmt == "frame_binary":
            data = _aggregate_frame_labels(data)
        per_error[name] = data
        all_keys.update(data)

    labels: dict[str, RepLabel] = {}
    for key in sorted(all_keys):
        raw: dict[str, object] = {}
        for name in spec.error_names:
            default: object = [] if spec.label_format(name) == "interval" else 0
            raw[name] = per_error[name].get(key, default)

        present = [name for name in spec.error_names if bool(raw[name])]
        multihot = np.array(
            [1.0 if name in present else 0.0 for name in spec.error_names], dtype=np.float32
        )
        labels[key] = RepLabel(
            rep_key=key,
            subject_id=extract_subject_id(key),
            exercise=exercise,
            errors=present,
            raw=raw,
            score=derive_score(spec, raw, multihot),
            multihot=multihot,
        )
    return labels


def load_splits(exercise: str, dataset_root: Path | str) -> dict[str, list[str]]:
    """Official ``{"train": [...], "val": [...], "test": [...]}`` rep keys."""
    root = Path(dataset_root)
    splits: dict[str, list[str]] = {}
    for split, rel_path in EXERCISES[exercise].splits.items():
        with open(root / rel_path) as fh:
            splits[split] = list(json.load(fh))
    return splits


def class_balance(labels: dict[str, RepLabel], exercise: str) -> list[dict[str, Any]]:
    """Per-error positive/negative counts and imbalance ratio."""
    names = error_names(exercise)
    rows = []
    for i, name in enumerate(names):
        n_pos = sum(1 for r in labels.values() if r.multihot[i] == 1)
        n_neg = len(labels) - n_pos
        rows.append({"error": name, "n_pos": n_pos, "n_neg": n_neg, "ratio": n_neg / max(n_pos, 1)})
    return rows
