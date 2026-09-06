"""MediaPipe Pose Landmarker (Tasks API, ``mediapipe >= 0.10``) extraction backend.

Requires the ``pose`` extra: ``pip install "exercise-advisor[pose]"``.
"""

from __future__ import annotations

import logging
import urllib.request
from pathlib import Path

import numpy as np

log = logging.getLogger(__name__)

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
)
DEFAULT_MODEL_PATH = Path.home() / ".cache" / "exercise-advisor" / "pose_landmarker_lite.task"
N_LANDMARKS = 33


def ensure_model(model_path: Path = DEFAULT_MODEL_PATH) -> Path:
    """Download the lite pose-landmarker task file on first use."""
    if not model_path.exists():
        model_path.parent.mkdir(parents=True, exist_ok=True)
        log.info("downloading pose landmarker model to %s", model_path)
        urllib.request.urlretrieve(MODEL_URL, model_path)
    return model_path


def _import_mediapipe():
    try:
        import cv2
        import mediapipe as mp
        from mediapipe.tasks import python as mp_python
        from mediapipe.tasks.python import vision as mp_vision
    except ImportError as exc:  # pragma: no cover - depends on optional extra
        raise ImportError(
            "MediaPipe backend needs the 'pose' extra: pip install 'exercise-advisor[pose]'"
        ) from exc
    return cv2, mp, mp_python, mp_vision


class MediaPipePoseExtractor:
    """Extract ``(T, 33, 3)`` normalised landmarks from a video or a single image.

    Frames where no pose is detected are filled with ``NaN`` and later interpolated
    by :func:`exercise_advisor.features.fill_nan_frames`.
    """

    def __init__(self, model_path: Path = DEFAULT_MODEL_PATH, prefer_gpu: bool = True) -> None:
        cv2, mp, mp_python, mp_vision = _import_mediapipe()
        self._cv2, self._mp, self._mp_python, self._mp_vision = cv2, mp, mp_python, mp_vision
        ensure_model(model_path)

        self.backend = "cpu"
        self._landmarker = None
        if prefer_gpu:
            try:
                self._landmarker = self._build(model_path, use_gpu=True)
                self.backend = "gpu"
            except Exception as exc:
                log.info("GPU delegate unavailable (%s); using CPU", exc)
        if self._landmarker is None:
            self._landmarker = self._build(model_path, use_gpu=False)

    def _build(self, model_path: Path, use_gpu: bool):
        base_kwargs = {"model_asset_path": str(model_path)}
        if use_gpu and hasattr(self._mp_python.BaseOptions, "Delegate"):
            base_kwargs["delegate"] = self._mp_python.BaseOptions.Delegate.GPU
        options = self._mp_vision.PoseLandmarkerOptions(
            base_options=self._mp_python.BaseOptions(**base_kwargs),
            running_mode=self._mp_vision.RunningMode.IMAGE,
            num_poses=1,
            min_pose_detection_confidence=0.5,
            min_pose_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        return self._mp_vision.PoseLandmarker.create_from_options(options)

    def extract_frame(self, frame_bgr: np.ndarray) -> np.ndarray:
        """``(H, W, 3)`` BGR frame -> ``(33, 3)`` landmarks (NaN if no pose found)."""
        rgb = self._cv2.cvtColor(frame_bgr, self._cv2.COLOR_BGR2RGB)
        image = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=rgb)
        assert self._landmarker is not None, "extractor has been closed"
        result = self._landmarker.detect(image)
        if result.pose_landmarks:
            return np.array([[p.x, p.y, p.z] for p in result.pose_landmarks[0]], dtype=np.float32)
        return np.full((N_LANDMARKS, 3), np.nan, dtype=np.float32)

    def extract(self, video_path: Path) -> np.ndarray | None:
        """Video file -> ``(T, 33, 3)`` or ``None`` if the file cannot be read."""
        cap = self._cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            log.error("cannot open %s", video_path)
            return None
        frames = []
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frames.append(self.extract_frame(frame))
        cap.release()
        return np.stack(frames) if frames else None

    def extract_image(self, image_path: Path) -> np.ndarray | None:
        """Single image -> ``(1, 33, 3)`` or ``None``."""
        frame = self._cv2.imread(str(image_path))
        if frame is None:
            return None
        return self.extract_frame(frame)[None, ...]

    def close(self) -> None:
        if self._landmarker is not None:
            self._landmarker.close()
            self._landmarker = None

    def __enter__(self) -> MediaPipePoseExtractor:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()
