"""Human-readable coaching cues for each detectable error."""

from __future__ import annotations

FEEDBACK: dict[str, dict[str, str]] = {
    "OHP": {
        "error_elbows": (
            "Elbow flare detected. Keep the elbows slightly in front of the bar rather "
            "than flared out to the sides to protect the shoulder joint."
        ),
        "error_knees": (
            "Knee bend detected during the press. Lock the knees and brace the legs "
            "throughout the lift to keep a stable base."
        ),
    },
    "Squat": {
        "knees_inward": (
            "Knee cave (valgus collapse) detected. Drive the knees out in line with the "
            "toes on both the descent and the ascent."
        ),
        "knees_forward": (
            "Excessive forward knee travel. Shift the weight towards the heels and push "
            "the hips back to reduce anterior knee stress."
        ),
        "shallow_depth": (
            "Shallow squat depth. Aim to break parallel (hip crease below the knee) for a "
            "full range of motion."
        ),
    },
    "BarbellRow": {
        "lumbar_error": (
            "Lumbar rounding detected. Keep a neutral spine by hinging at the hips and "
            "bracing the core."
        ),
        "torso_angle": (
            "Torso too upright. Aim for roughly a 45 degree forward lean to load the lats "
            "and protect the lower back."
        ),
    },
}

GRADE_BANDS: tuple[tuple[float, str], ...] = (
    (0.90, "A"),
    (0.75, "B"),
    (0.60, "C"),
    (0.40, "D"),
)


def score_to_grade(score: float) -> str:
    """Map a quality score in [0, 1] to a letter grade A-F."""
    for floor, grade in GRADE_BANDS:
        if score >= floor:
            return grade
    return "F"


def feedback_for(exercise: str, error_name: str) -> str:
    return FEEDBACK.get(exercise, {}).get(error_name, f"Error detected: {error_name}")
