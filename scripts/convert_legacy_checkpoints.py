"""Convert notebook-era checkpoints into the versioned, ``weights_only``-safe format.

The original research notebook saved ``torch.save({"model_state": ..., "config": Config(...),
"history": {...}, "best_threshold": ...})`` where ``Config`` was a dataclass defined in
``__main__``. Those files cannot be unpickled anywhere else. This script loads them with
a compatibility shim and rewrites them with
:func:`exercise_advisor.models.checkpoint.save_checkpoint`.

Usage::

    python scripts/convert_legacy_checkpoints.py --src old_checkpoints/ --dst checkpoints/
"""

from __future__ import annotations

import argparse
import pickle
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch

from exercise_advisor.config import Config
from exercise_advisor.models.checkpoint import build_model, checkpoint_path, save_checkpoint


@dataclass
class _LegacyConfig:
    """Stand-in with the attributes the notebook's ``Config`` had."""

    fixed_len: int = 100
    n_landmarks: int = 33
    n_coords: int = 3
    feature_dim: int = 222
    use_angles: bool = True
    use_velocity: bool = True
    batch_size: int = 32
    lr: float = 3e-4
    max_epochs: int = 200
    patience: int = 30
    weight_decay: float = 5e-4
    pos_weight_scale: float = 1.0
    focal_gamma: float = 2.0
    label_smoothing: float = 0.0
    hidden_dim: int = 128
    n_layers: int = 6
    dropout: float = 0.3
    oversample_factors: Any = None


class _CompatUnpickler(pickle.Unpickler):
    def find_class(self, module: str, name: str) -> Any:
        if module == "__main__" and name == "Config":
            return _LegacyConfig
        return super().find_class(module, name)


class _CompatPickle:
    Unpickler = _CompatUnpickler
    load = staticmethod(lambda f, **kw: _CompatUnpickler(f, **kw).load())
    __name__ = "pickle"


def convert(src: Path, dst_dir: Path) -> Path | None:
    legacy = torch.load(src, map_location="cpu", weights_only=False, pickle_module=_CompatPickle)
    if "class_name" not in legacy:
        print(f"skip {src.name}: multi-label checkpoint from the earlier approach")
        return None
    old = legacy["config"]
    cfg = Config(
        fixed_len=old.fixed_len,
        use_angles=old.use_angles,
        use_velocity=old.use_velocity,
        hidden_dim=old.hidden_dim,
        n_layers=old.n_layers,
        dropout=old.dropout,
        batch_size=old.batch_size,
        lr=old.lr,
        weight_decay=old.weight_decay,
        max_epochs=old.max_epochs,
        patience=old.patience,
    )
    model = build_model(cfg, n_error_classes=1)
    model.load_state_dict(legacy["model_state"])  # strict: verifies the architecture matches
    history = {k: v for k, v in legacy["history"].items() if isinstance(v, list)}
    out = save_checkpoint(
        checkpoint_path(dst_dir, legacy["exercise"], legacy["class_name"]),
        model,
        cfg,
        legacy["exercise"],
        legacy["class_name"],
        legacy["class_idx"],
        legacy["best_threshold"],
        history,
    )
    print(f"{src.name} -> {out}  (threshold={legacy['best_threshold']:.2f}, "
          f"epochs={len(history.get('val_loss', []))})")  # fmt: skip
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--src", type=Path, required=True, help="directory of legacy *_best.pt files")
    ap.add_argument("--dst", type=Path, required=True, help="output checkpoint directory")
    args = ap.parse_args()
    converted = [convert(p, args.dst) for p in sorted(args.src.glob("*_best.pt"))]
    print(f"converted {sum(c is not None for c in converted)} checkpoint(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
