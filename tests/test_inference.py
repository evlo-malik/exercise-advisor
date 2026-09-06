from pathlib import Path

import numpy as np
import pytest

from exercise_advisor.data.labels import error_names
from exercise_advisor.inference.feedback import FEEDBACK, feedback_for, score_to_grade
from exercise_advisor.inference.predictor import AQAPredictor
from exercise_advisor.models.checkpoint import build_model, checkpoint_path, save_checkpoint


class FakeExtractor:
    def __init__(self, landmarks: np.ndarray | None) -> None:
        self.landmarks = landmarks
        self.calls: list[Path] = []

    def extract(self, video_path: Path) -> np.ndarray | None:
        self.calls.append(video_path)
        return self.landmarks


@pytest.fixture
def fake_checkpoints(tmp_path, tiny_config):
    for exercise in ("OHP", "Squat", "BarbellRow"):
        for idx, name in enumerate(error_names(exercise)):
            save_checkpoint(
                checkpoint_path(tmp_path, exercise, name), build_model(tiny_config), tiny_config,
                exercise, name, idx, threshold=0.5,
            )  # fmt: skip
    return tmp_path


def test_grades():
    assert score_to_grade(0.95) == "A"
    assert score_to_grade(0.75) == "B"
    assert score_to_grade(0.61) == "C"
    assert score_to_grade(0.40) == "D"
    assert score_to_grade(0.1) == "F"


def test_feedback_covers_every_error_class():
    for exercise in ("OHP", "Squat", "BarbellRow"):
        for name in error_names(exercise):
            assert name in FEEDBACK[exercise]
    assert feedback_for("OHP", "unknown").startswith("Error detected")


def test_predictor_end_to_end(fake_checkpoints, landmarks):
    extractor = FakeExtractor(landmarks)
    predictor = AQAPredictor("Squat", fake_checkpoints, device="cpu", extractor=extractor)
    pred = predictor.predict("clip.mp4")
    assert extractor.calls == [Path("clip.mp4")]
    assert pred.exercise == "Squat"
    assert set(pred.probabilities) == set(error_names("Squat"))
    assert all(0.0 <= p <= 1.0 for p in pred.probabilities.values())
    assert pred.score == pytest.approx(1 - np.mean(list(pred.probabilities.values())))
    assert pred.grade in "ABCDF"
    assert len(pred.feedback) == len(pred.errors)
    assert "Score" in str(pred)
    assert pred.to_dict()["source"] == "clip.mp4"


def test_predictor_uses_thresholds(fake_checkpoints, landmarks):
    predictor = AQAPredictor("OHP", fake_checkpoints, device="cpu", extractor=FakeExtractor(None))
    predictor.thresholds = dict.fromkeys(predictor.error_names, 0.0)
    assert predictor.predict_landmarks(landmarks).errors == predictor.error_names
    predictor.thresholds = dict.fromkeys(predictor.error_names, 1.01)
    assert predictor.predict_landmarks(landmarks).errors == []


def test_predictor_raises_when_extraction_fails(fake_checkpoints):
    predictor = AQAPredictor("OHP", fake_checkpoints, device="cpu", extractor=FakeExtractor(None))
    with pytest.raises(RuntimeError):
        predictor.predict("missing.mp4")


def test_predictor_missing_checkpoint(tmp_path):
    with pytest.raises(FileNotFoundError):
        AQAPredictor("OHP", tmp_path, device="cpu")
