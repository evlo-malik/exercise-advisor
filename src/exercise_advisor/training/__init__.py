"""Per-class binary training, threshold tuning and evaluation."""

from exercise_advisor.training.evaluation import (
    EvaluationResult,
    evaluate_exercise,
    per_class_metrics,
    predict_multilabel,
)
from exercise_advisor.training.trainer import EarlyStopping, sweep_threshold, train_binary

__all__ = [
    "EarlyStopping",
    "EvaluationResult",
    "evaluate_exercise",
    "per_class_metrics",
    "predict_multilabel",
    "sweep_threshold",
    "train_binary",
]
