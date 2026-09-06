"""``AQAPredictor``: load per-class checkpoints and score a single-rep video."""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Protocol

import numpy as np
import torch

from exercise_advisor.config import Config
from exercise_advisor.data.labels import error_names
from exercise_advisor.features import build_feature_vector, interpolate_sequence
from exercise_advisor.inference.feedback import feedback_for, score_to_grade
from exercise_advisor.models.checkpoint import checkpoint_path, load_checkpoint

log = logging.getLogger(__name__)


class LandmarkExtractor(Protocol):
    """Anything that turns a video path into ``(T, 33, 3)`` landmarks (or ``None``)."""

    def extract(self, video_path: Path) -> np.ndarray | None: ...


@dataclass
class AQAPrediction:
    exercise: str
    source: str
    score: float
    grade: str
    errors: list[str]
    feedback: list[str]
    probabilities: dict[str, float]
    thresholds: dict[str, float]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def __str__(self) -> str:
        lines = [
            f"Exercise : {self.exercise}",
            f"Source   : {self.source}",
            f"Score    : {self.score:.2f}  [{self.grade}]",
        ]
        for name, prob in self.probabilities.items():
            flag = "!" if name in self.errors else " "
            lines.append(f"  {flag} {name:<16} p={prob:.2f}  (t={self.thresholds[name]:.2f})")
        if self.feedback:
            lines.append("Feedback :")
            lines.extend(f"  - {fb}" for fb in self.feedback)
        else:
            lines.append("Feedback : no errors detected, clean rep")
        return "\n".join(lines)


class AQAPredictor:
    """Load one binary checkpoint per error class and expose ``predict`` / ``predict_landmarks``.

    Parameters
    ----------
    exercise:        ``"OHP"``, ``"Squat"`` or ``"BarbellRow"``.
    checkpoint_dir:  directory holding ``{exercise}_{error}.pt`` files.
    device:          ``"auto"``, ``"cpu"`` or ``"cuda"``.
    extractor:       optional landmark extractor; defaults to the MediaPipe backend
                     (requires the ``pose`` extra) and is only built when ``predict`` runs.
    """

    def __init__(
        self,
        exercise: str,
        checkpoint_dir: Path | str = "checkpoints",
        device: str = "auto",
        extractor: LandmarkExtractor | None = None,
    ) -> None:
        self.exercise = exercise
        self.error_names = error_names(exercise)
        self.device = torch.device(
            ("cuda" if torch.cuda.is_available() else "cpu") if device == "auto" else device
        )
        self.models: dict[str, torch.nn.Module] = {}
        self.thresholds: dict[str, float] = {}
        self.config: Config | None = None
        for name in self.error_names:
            path = checkpoint_path(checkpoint_dir, exercise, name)
            if not path.exists():
                raise FileNotFoundError(f"missing checkpoint for {exercise}/{name}: {path}")
            model, meta = load_checkpoint(path, self.device)
            self.models[name] = model
            self.thresholds[name] = float(meta["threshold"])
            self.config = self.config or meta["config"]
        assert self.config is not None
        self._extractor = extractor
        log.info("AQAPredictor ready for %s (%d models)", exercise, len(self.models))

    @property
    def extractor(self) -> LandmarkExtractor:
        if self._extractor is None:
            from exercise_advisor.pose.mediapipe_extractor import MediaPipePoseExtractor

            self._extractor = MediaPipePoseExtractor()
        return self._extractor

    @torch.no_grad()
    def predict_landmarks(self, landmarks: np.ndarray, source: str = "<array>") -> AQAPrediction:
        """Score a ``(T, 33, 3)`` landmark sequence."""
        assert self.config is not None
        cfg = self.config
        feats = build_feature_vector(landmarks, cfg.use_angles, cfg.use_velocity)
        feats = interpolate_sequence(feats, cfg.fixed_len)
        x = torch.from_numpy(feats).unsqueeze(0).to(self.device)

        probs = {
            name: float(torch.sigmoid(self.models[name](x)).item()) for name in self.error_names
        }
        flagged = [n for n in self.error_names if probs[n] >= self.thresholds[n]]
        score = float(1.0 - np.mean(list(probs.values())))
        return AQAPrediction(
            exercise=self.exercise,
            source=source,
            score=score,
            grade=score_to_grade(score),
            errors=flagged,
            feedback=[feedback_for(self.exercise, n) for n in flagged],
            probabilities=probs,
            thresholds=dict(self.thresholds),
        )

    def predict(self, video_path: Path | str) -> AQAPrediction:
        """Extract landmarks from ``video_path`` and score the rep."""
        video_path = Path(video_path)
        landmarks = self.extractor.extract(video_path)
        if landmarks is None:
            raise RuntimeError(f"could not extract a pose from {video_path}")
        return self.predict_landmarks(landmarks, source=str(video_path))
