"""Draw the 33-landmark skeleton on frames (requires ``opencv-python``)."""

from __future__ import annotations

import numpy as np

from exercise_advisor.pose.landmarks import POSE_CONNECTIONS

_TORSO = {11, 12, 23, 24}
_L_ARM = {11, 13, 15, 17, 19, 21}
_R_ARM = {12, 14, 16, 18, 20, 22}
_L_LEG = {23, 25, 27, 29, 31}
_R_LEG = {24, 26, 28, 30, 32}
_MAJOR = {11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28}


def _connection_color(i: int, j: int) -> tuple[int, int, int]:
    """BGR colour per body region."""
    pair = {i, j}
    if pair <= _TORSO:
        return (255, 200, 0)
    if pair <= _L_ARM:
        return (0, 255, 128)
    if pair <= _R_ARM:
        return (0, 128, 255)
    if pair <= _L_LEG:
        return (255, 0, 128)
    if pair <= _R_LEG:
        return (128, 0, 255)
    return (200, 200, 200)


def draw_landmarks(
    frame: np.ndarray,
    landmarks: np.ndarray,
    radius: int = 4,
    thickness: int = 2,
) -> np.ndarray:
    """Overlay landmarks ``(33, 2|3)`` in normalised image coordinates on a BGR frame."""
    import cv2

    h, w = frame.shape[:2]
    out = frame.copy()
    pts = [(int(lm[0] * w), int(lm[1] * h)) for lm in landmarks]
    missing = np.isnan(landmarks[:, :2]).any(axis=1)

    for i, j in POSE_CONNECTIONS:
        if missing[i] or missing[j]:
            continue
        cv2.line(out, pts[i], pts[j], _connection_color(i, j), thickness, cv2.LINE_AA)

    for idx, (px, py) in enumerate(pts):
        if missing[idx]:
            continue
        r = radius + 2 if idx in _MAJOR else radius
        cv2.circle(out, (px, py), r, (255, 255, 255), -1, cv2.LINE_AA)
        cv2.circle(out, (px, py), r, (0, 0, 0), 1, cv2.LINE_AA)
    return out
