"""MediaPipe Pose 33-landmark conventions shared by every stage of the pipeline."""

from __future__ import annotations

LANDMARK_NAMES: tuple[str, ...] = (
    "nose",
    "left_eye_inner",
    "left_eye",
    "left_eye_outer",
    "right_eye_inner",
    "right_eye",
    "right_eye_outer",
    "left_ear",
    "right_ear",
    "mouth_left",
    "mouth_right",
    "left_shoulder",
    "right_shoulder",
    "left_elbow",
    "right_elbow",
    "left_wrist",
    "right_wrist",
    "left_pinky",
    "right_pinky",
    "left_index",
    "right_index",
    "left_thumb",
    "right_thumb",
    "left_hip",
    "right_hip",
    "left_knee",
    "right_knee",
    "left_ankle",
    "right_ankle",
    "left_heel",
    "right_heel",
    "left_foot_index",
    "right_foot_index",
)

#: name -> landmark index
IDX: dict[str, int] = {name: i for i, name in enumerate(LANDMARK_NAMES)}

#: (joint, proximal, distal) triplets; the angle is measured at ``joint``.
ANGLE_TRIPLETS: tuple[tuple[str, str, str], ...] = (
    ("left_elbow", "left_shoulder", "left_wrist"),
    ("right_elbow", "right_shoulder", "right_wrist"),
    ("left_shoulder", "left_hip", "left_elbow"),
    ("right_shoulder", "right_hip", "right_elbow"),
    ("left_hip", "left_shoulder", "left_knee"),
    ("right_hip", "right_shoulder", "right_knee"),
    ("left_knee", "left_hip", "left_ankle"),
    ("right_knee", "right_hip", "right_ankle"),
    ("left_ankle", "left_knee", "left_hip"),
    ("right_ankle", "right_knee", "right_hip"),
    ("left_wrist", "left_elbow", "left_shoulder"),
    ("right_wrist", "right_elbow", "right_shoulder"),
)

#: (left_idx, right_idx) pairs swapped together by a horizontal flip.
LR_SWAP_PAIRS: tuple[tuple[int, int], ...] = (
    (1, 4),
    (2, 5),
    (3, 6),
    (7, 8),
    (9, 10),
    (11, 12),
    (13, 14),
    (15, 16),
    (17, 18),
    (19, 20),
    (21, 22),
    (23, 24),
    (25, 26),
    (27, 28),
    (29, 30),
    (31, 32),
)

#: Skeleton edges used for drawing overlays (MediaPipe ``POSE_CONNECTIONS``).
POSE_CONNECTIONS: tuple[tuple[int, int], ...] = (
    # face
    (0, 1), (1, 2), (2, 3), (3, 7),
    (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10),
    # torso
    (11, 12), (11, 23), (12, 24), (23, 24),
    # left arm
    (11, 13), (13, 15), (15, 17), (15, 19), (15, 21), (17, 19),
    # right arm
    (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
    # left leg
    (23, 25), (25, 27), (27, 29), (27, 31), (29, 31),
    # right leg
    (24, 26), (26, 28), (28, 30), (28, 32), (30, 32),
)  # fmt: skip

#: COCO-17 keypoint index -> slot in the 33-landmark layout (TorchVision fallback).
COCO_TO_MEDIAPIPE: dict[int, int] = {
    0: 0,  # nose
    1: 2,  # left_eye
    2: 5,  # right_eye
    3: 7,  # left_ear
    4: 8,  # right_ear
    5: 11,  # left_shoulder
    6: 12,  # right_shoulder
    7: 13,  # left_elbow
    8: 14,  # right_elbow
    9: 15,  # left_wrist
    10: 16,  # right_wrist
    11: 23,  # left_hip
    12: 24,  # right_hip
    13: 25,  # left_knee
    14: 26,  # right_knee
    15: 27,  # left_ankle
    16: 28,  # right_ankle
}
