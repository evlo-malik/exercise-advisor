"""TorchVision Keypoint R-CNN fallback backend (COCO-17 keypoints mapped into 33 slots).

Requires the ``torchvision`` extra. Unmapped landmarks are ``NaN`` and interpolated
downstream; ``z`` is always ``0``.
"""

from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import torch

from exercise_advisor.pose.landmarks import COCO_TO_MEDIAPIPE

log = logging.getLogger(__name__)
N_LANDMARKS = 33


class TorchPoseExtractor:
    def __init__(self, score_thr: float = 0.5, kpt_thr: float = 0.2, device: str = "auto") -> None:
        try:
            import cv2
            import torchvision
            from torchvision.transforms import functional as tvf
        except ImportError as exc:  # pragma: no cover
            raise ImportError(
                "TorchVision backend needs: pip install 'exercise-advisor[torchvision]'"
            ) from exc
        self._cv2, self._tvf = cv2, tvf
        self.device = torch.device(
            ("cuda" if torch.cuda.is_available() else "cpu") if device == "auto" else device
        )
        weights = torchvision.models.detection.KeypointRCNN_ResNet50_FPN_Weights.DEFAULT
        self.model = torchvision.models.detection.keypointrcnn_resnet50_fpn(weights=weights)
        self.model.to(self.device).eval()
        self.score_thr = score_thr
        self.kpt_thr = kpt_thr
        self.backend = f"torchvision:{self.device.type}"

    @torch.no_grad()
    def extract_frame(self, frame_bgr: np.ndarray) -> np.ndarray:
        h, w = frame_bgr.shape[:2]
        rgb = self._cv2.cvtColor(frame_bgr, self._cv2.COLOR_BGR2RGB)
        out = self.model([self._tvf.to_tensor(rgb).to(self.device)])[0]

        lm = np.full((N_LANDMARKS, 3), np.nan, dtype=np.float32)
        if len(out["scores"]) == 0:
            return lm
        best = int(torch.argmax(out["scores"]).item())
        if float(out["scores"][best]) < self.score_thr:
            return lm
        kpts = out["keypoints"][best].cpu().numpy()
        kpt_scores = (
            out["keypoints_scores"][best].cpu().numpy()
            if "keypoints_scores" in out
            else np.ones(len(kpts))
        )
        for coco_idx, slot in COCO_TO_MEDIAPIPE.items():
            if kpt_scores[coco_idx] >= self.kpt_thr:
                lm[slot, 0] = np.clip(kpts[coco_idx, 0] / max(w, 1), 0.0, 1.0)
                lm[slot, 1] = np.clip(kpts[coco_idx, 1] / max(h, 1), 0.0, 1.0)
                lm[slot, 2] = 0.0
        return lm

    def extract(self, video_path: Path) -> np.ndarray | None:
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
        return np.stack(frames).astype(np.float32) if frames else None

    def extract_image(self, image_path: Path) -> np.ndarray | None:
        frame = self._cv2.imread(str(image_path))
        if frame is None:
            return None
        return self.extract_frame(frame)[None, ...]
