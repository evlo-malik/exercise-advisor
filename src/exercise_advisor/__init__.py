"""Exercise Advisor: pose-based action quality assessment for barbell exercises.

The package is organised as a pipeline:

``pose``      -> extract 33 MediaPipe landmarks per frame from video / images
``features``  -> normalise landmarks and build a (T, 222) feature sequence
``data``      -> labels, subject-aware splits and PyTorch datasets
``models``    -> the ``ExerciseTCN`` temporal convolutional network
``training``  -> per-class binary training, threshold tuning and evaluation
``inference`` -> ``AQAPredictor``: video in, score + coaching feedback out
"""

from __future__ import annotations

from exercise_advisor.config import Config, Paths
from exercise_advisor.data.labels import EXERCISES, RepLabel, load_exercise_labels, load_splits
from exercise_advisor.features import build_feature_vector, interpolate_sequence
from exercise_advisor.inference.predictor import AQAPrediction, AQAPredictor
from exercise_advisor.models.tcn import ExerciseTCN

__version__ = "1.0.0"

__all__ = [
    "EXERCISES",
    "AQAPrediction",
    "AQAPredictor",
    "Config",
    "ExerciseTCN",
    "Paths",
    "RepLabel",
    "__version__",
    "build_feature_vector",
    "interpolate_sequence",
    "load_exercise_labels",
    "load_splits",
]
