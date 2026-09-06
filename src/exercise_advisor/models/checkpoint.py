"""Checkpoint serialisation.

Checkpoints are plain dictionaries of tensors, numbers, strings and lists so they load
with ``torch.load(..., weights_only=True)`` and do not depend on any Python class.

::

    {
      "format_version": 1,
      "model_state": <state_dict>,
      "config": Config.to_dict(),
      "exercise": "OHP",
      "class_name": "error_elbows",
      "class_idx": 0,
      "threshold": 0.55,           # tuned on the validation split
      "history": {"train_loss": [...], "val_loss": [...], "lr": [...]},
    }
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import torch

from exercise_advisor.config import Config
from exercise_advisor.models.tcn import ExerciseTCN

CHECKPOINT_FORMAT_VERSION = 1


def checkpoint_path(checkpoint_dir: Path | str, exercise: str, class_name: str) -> Path:
    return Path(checkpoint_dir) / f"{exercise}_{class_name}.pt"


def build_model(cfg: Config, n_error_classes: int = 1) -> ExerciseTCN:
    return ExerciseTCN(
        input_dim=cfg.feature_dim,
        n_error_classes=n_error_classes,
        hidden_dim=cfg.hidden_dim,
        n_layers=cfg.n_layers,
        kernel_size=cfg.kernel_size,
        dropout=cfg.dropout,
    )


def save_checkpoint(
    path: Path | str,
    model: torch.nn.Module,
    cfg: Config,
    exercise: str,
    class_name: str,
    class_idx: int,
    threshold: float,
    history: dict[str, list[float]] | None = None,
) -> Path:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(model, (torch.nn.DataParallel, torch.nn.parallel.DistributedDataParallel)):
        model = model.module
    state = model.state_dict()
    payload: dict[str, Any] = {
        "format_version": CHECKPOINT_FORMAT_VERSION,
        "model_state": {k: v.detach().cpu() for k, v in state.items()},
        "config": cfg.to_dict(),
        "exercise": exercise,
        "class_name": class_name,
        "class_idx": int(class_idx),
        "threshold": float(threshold),
        "history": {k: [float(x) for x in v] for k, v in (history or {}).items()},
    }
    torch.save(payload, path)
    return path


def load_checkpoint(
    path: Path | str, device: torch.device | str = "cpu"
) -> tuple[ExerciseTCN, dict[str, Any]]:
    """Load a checkpoint into a fresh ``ExerciseTCN`` in eval mode.

    Returns ``(model, metadata)`` where ``metadata`` is the checkpoint dict without
    ``model_state``.
    """
    payload = torch.load(Path(path), map_location="cpu", weights_only=True)
    version = payload.get("format_version")
    if version != CHECKPOINT_FORMAT_VERSION:
        raise ValueError(
            f"{path}: unsupported checkpoint format {version!r} "
            f"(expected {CHECKPOINT_FORMAT_VERSION}); see scripts/convert_legacy_checkpoints.py"
        )
    cfg = Config.from_dict(payload["config"])
    state = payload["model_state"]
    n_classes = state["cls_head.3.weight"].shape[0]
    model = build_model(cfg, n_error_classes=n_classes)
    model.load_state_dict(state)
    model.to(device).eval()
    meta = {k: v for k, v in payload.items() if k != "model_state"}
    meta["config"] = cfg
    return model, meta
