"""Batch pose extraction for every labelled rep of an exercise.

OHP and Squat reps are ``.mp4`` clips; BarbellRow reps are single ``.jpg`` frames, so
each BarbellRow pose file has shape ``(1, 33, 3)``.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Protocol

import numpy as np

from exercise_advisor.config import Paths

log = logging.getLogger(__name__)


class FrameExtractor(Protocol):
    def extract(self, video_path: Path) -> np.ndarray | None: ...

    def extract_image(self, image_path: Path) -> np.ndarray | None: ...


def _source_path(exercise: str, rep_key: str, paths: Paths) -> Path:
    if exercise == "BarbellRow":
        return paths.barbell_images_dir / f"{rep_key}.jpg"
    return paths.video_dir(exercise) / f"{rep_key}.mp4"


def extract_poses(
    exercise: str,
    rep_keys: list[str],
    extractor: FrameExtractor,
    paths: Paths,
    overwrite: bool = False,
    max_items: int | None = None,
    log_every: int = 50,
) -> dict[str, Path]:
    """Extract and cache ``{pose_root}/{exercise}/{rep_key}.npy`` for each rep key.

    Returns ``{rep_key: npy_path}`` for every rep that now has a cached pose.
    """
    out_dir = paths.pose_dir(exercise)
    out_dir.mkdir(parents=True, exist_ok=True)
    keys = rep_keys[:max_items] if max_items else rep_keys

    saved: dict[str, Path] = {}
    missing, failed = 0, 0
    for i, key in enumerate(keys, start=1):
        out_path = out_dir / f"{key}.npy"
        if out_path.exists() and not overwrite:
            saved[key] = out_path
            continue
        src = _source_path(exercise, key, paths)
        if not src.exists():
            missing += 1
            continue
        landmarks = extractor.extract_image(src) if src.suffix == ".jpg" else extractor.extract(src)
        if landmarks is None:
            failed += 1
            continue
        np.save(out_path, landmarks.astype(np.float32))
        saved[key] = out_path
        if i % log_every == 0:
            log.info("[%s] %d/%d processed", exercise, i, len(keys))

    log.info("[%s] cached=%d missing_source=%d failed=%d", exercise, len(saved), missing, failed)
    return saved
