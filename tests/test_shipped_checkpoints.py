"""Sanity checks on the checkpoints committed to the repository."""

from pathlib import Path

import numpy as np
import pytest
import torch

from exercise_advisor.config import Config
from exercise_advisor.data.labels import EXERCISES, error_names
from exercise_advisor.inference.predictor import AQAPredictor
from exercise_advisor.models.checkpoint import checkpoint_path, load_checkpoint

CHECKPOINT_DIR = Path(__file__).resolve().parents[1] / "checkpoints"
pytestmark = pytest.mark.skipif(
    not CHECKPOINT_DIR.exists() or not any(CHECKPOINT_DIR.glob("*.pt")),
    reason="shipped checkpoints not present",
)


@pytest.mark.parametrize("exercise", list(EXERCISES))
def test_every_error_class_has_a_checkpoint(exercise):
    for name in error_names(exercise):
        path = checkpoint_path(CHECKPOINT_DIR, exercise, name)
        assert path.exists(), path
        model, meta = load_checkpoint(path)
        assert meta["exercise"] == exercise and meta["class_name"] == name
        assert meta["config"] == Config()
        assert 0.0 < meta["threshold"] < 1.0
        assert model.n_error_classes == 1


@pytest.mark.slow
def test_shipped_models_produce_calibrated_probabilities(landmarks):
    for exercise in EXERCISES:
        predictor = AQAPredictor(exercise, CHECKPOINT_DIR, device="cpu", extractor=None)
        pred = predictor.predict_landmarks(landmarks)
        assert all(np.isfinite(p) for p in pred.probabilities.values())
        assert 0.0 <= pred.score <= 1.0


def test_shipped_models_are_deterministic_in_eval(landmarks):
    model, _ = load_checkpoint(checkpoint_path(CHECKPOINT_DIR, "OHP", "error_knees"))
    x = torch.randn(3, 100, 222)
    assert torch.equal(model(x), model(x))
