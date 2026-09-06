import numpy as np
import pytest

from exercise_advisor.data.labels import (
    EXERCISES,
    class_balance,
    error_names,
    extract_subject_id,
    intervals_to_score,
    load_exercise_labels,
    load_splits,
)
from exercise_advisor.data.splits import build_subject_split, verify_subject_splits


def test_extract_subject_id():
    assert extract_subject_id("46777_3") == "46777"
    assert extract_subject_id("56067_3_51") == "56067"


def test_intervals_to_score():
    assert intervals_to_score({"a": []}) == 1.0
    assert intervals_to_score({"a": [[0.0, 4.0]]}, clip_duration_s=8.0) == pytest.approx(0.5)
    assert intervals_to_score({"a": [[0.0, 20.0]]}) == 0.0
    assert intervals_to_score({"a": 1}) == 1.0  # binary values are ignored here


@pytest.mark.parametrize("exercise", list(EXERCISES))
def test_load_labels_and_splits(synthetic_dataset, exercise):
    labels = load_exercise_labels(exercise, synthetic_dataset.dataset_root)
    splits = load_splits(exercise, synthetic_dataset.dataset_root)
    assert len(labels) == 36
    assert sum(len(v) for v in splits.values()) == 36
    names = error_names(exercise)
    for key, label in labels.items():
        assert label.rep_key == key
        assert label.multihot.shape == (len(names),)
        assert label.multihot.dtype == np.float32
        assert 0.0 <= label.score <= 1.0
        assert set(label.errors) <= set(names)
        assert (label.multihot == 1).sum() == len(label.errors)
        if not label.errors:
            assert label.score == 1.0
        else:
            assert label.score < 1.0


def test_frame_binary_labels_aggregate_to_rep_level(synthetic_dataset):
    labels = load_exercise_labels("Squat", synthetic_dataset.dataset_root)
    assert all(len(k.split("_")) == 2 for k in labels)


def test_official_splits_have_no_subject_leakage(synthetic_dataset):
    for exercise in EXERCISES:
        labels = load_exercise_labels(exercise, synthetic_dataset.dataset_root)
        splits = load_splits(exercise, synthetic_dataset.dataset_root)
        assert verify_subject_splits(labels, splits) == {}


def test_verify_subject_splits_detects_leak(synthetic_dataset):
    labels = load_exercise_labels("OHP", synthetic_dataset.dataset_root)
    splits = load_splits("OHP", synthetic_dataset.dataset_root)
    splits["val"].append(splits["train"][0])
    leaks = verify_subject_splits(labels, splits)
    assert ("train", "val") in leaks


def test_build_subject_split_is_subject_disjoint(synthetic_dataset):
    labels = load_exercise_labels("Squat", synthetic_dataset.dataset_root)
    splits = build_subject_split(labels, train_frac=0.6, val_frac=0.2, seed=1)
    assert sum(len(v) for v in splits.values()) == len(labels)
    assert verify_subject_splits(labels, splits) == {}
    with pytest.raises(ValueError):
        build_subject_split(labels, train_frac=0.9, val_frac=0.2)


def test_class_balance_rows(synthetic_dataset):
    labels = load_exercise_labels("BarbellRow", synthetic_dataset.dataset_root)
    rows = class_balance(labels, "BarbellRow")
    assert [r["error"] for r in rows] == error_names("BarbellRow")
    assert all(r["n_pos"] + r["n_neg"] == len(labels) for r in rows)
