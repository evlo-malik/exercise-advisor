"""End-to-end inference: video in, quality score and coaching feedback out."""

from exercise_advisor.inference.feedback import FEEDBACK, score_to_grade
from exercise_advisor.inference.predictor import AQAPrediction, AQAPredictor

__all__ = ["FEEDBACK", "AQAPrediction", "AQAPredictor", "score_to_grade"]
