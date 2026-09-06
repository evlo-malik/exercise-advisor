"""Subject-aware splitting: a subject must appear in exactly one of train / val / test."""

from __future__ import annotations

import logging
import random
from collections import defaultdict

from exercise_advisor.data.labels import RepLabel

log = logging.getLogger(__name__)


def verify_subject_splits(
    labels: dict[str, RepLabel],
    splits: dict[str, list[str]],
) -> dict[tuple[str, str], set[str]]:
    """Return overlapping subject ids for every pair of splits (empty dict == no leakage)."""
    subjects = {
        split: {labels[k].subject_id for k in keys if k in labels} for split, keys in splits.items()
    }
    names = list(subjects)
    leaks: dict[tuple[str, str], set[str]] = {}
    for i, a in enumerate(names):
        for b in names[i + 1 :]:
            overlap = subjects[a] & subjects[b]
            if overlap:
                leaks[(a, b)] = overlap
                log.warning("subject leakage between %s and %s: %d subjects", a, b, len(overlap))
    return leaks


def build_subject_split(
    labels: dict[str, RepLabel],
    train_frac: float = 0.70,
    val_frac: float = 0.15,
    seed: int = 42,
) -> dict[str, list[str]]:
    """Random subject-level split (each *subject*, not each rep, is assigned to a partition)."""
    if not 0 < train_frac < 1 or not 0 <= val_frac < 1 or train_frac + val_frac >= 1:
        raise ValueError("train_frac and val_frac must be in (0, 1) and sum to less than 1")

    by_subject: dict[str, list[str]] = defaultdict(list)
    for key, label in labels.items():
        by_subject[label.subject_id].append(key)

    subjects = sorted(by_subject)
    random.Random(seed).shuffle(subjects)

    n_train = int(len(subjects) * train_frac)
    n_val = int(len(subjects) * val_frac)
    partitions = {
        "train": subjects[:n_train],
        "val": subjects[n_train : n_train + n_val],
        "test": subjects[n_train + n_val :],
    }
    return {split: [k for s in subs for k in by_subject[s]] for split, subs in partitions.items()}
