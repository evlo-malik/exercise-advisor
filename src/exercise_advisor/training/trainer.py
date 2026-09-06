"""Train one binary ``ExerciseTCN`` per error class on a balanced 1:1 dataset.

Because the training set is balanced at the data level, plain ``BCEWithLogitsLoss``
is sufficient: no ``pos_weight``, focal loss or weighted sampler is needed. The
decision threshold is then tuned on the (unbalanced) validation split.
"""

from __future__ import annotations

import copy
import logging
import math
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np
import torch
from sklearn.metrics import f1_score, precision_score
from torch import nn
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader

from exercise_advisor.config import Config, seed_everything
from exercise_advisor.data.datasets import make_binary_dataloader
from exercise_advisor.data.labels import RepLabel, error_names
from exercise_advisor.models.checkpoint import build_model, checkpoint_path, save_checkpoint
from exercise_advisor.models.tcn import count_parameters

log = logging.getLogger(__name__)


class EarlyStopping:
    """Stop when validation loss has not improved by ``min_delta`` for ``patience`` epochs."""

    def __init__(self, patience: int = 30, min_delta: float = 1e-4) -> None:
        self.patience = patience
        self.min_delta = min_delta
        self.best = float("inf")
        self.counter = 0
        self.best_state: dict[str, torch.Tensor] | None = None

    def step(self, val_loss: float, model: nn.Module) -> bool:
        if val_loss < self.best - self.min_delta:
            self.best = val_loss
            self.counter = 0
            self.best_state = copy.deepcopy(model.state_dict())
            return False
        self.counter += 1
        return self.counter >= self.patience

    def restore_best(self, model: nn.Module) -> None:
        if self.best_state is not None:
            model.load_state_dict(self.best_state)


def _make_grad_scaler() -> Any:
    """``torch.amp.GradScaler`` (torch >= 2.3) with a fallback for older releases."""
    if hasattr(torch.amp, "GradScaler"):
        return torch.amp.GradScaler("cuda")
    return torch.cuda.amp.GradScaler()


def resolve_device(device: str | torch.device = "auto") -> torch.device:
    if device == "auto":
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return torch.device(device)


@torch.no_grad()
def collect_probs(
    model: nn.Module, loader: DataLoader, device: torch.device, label_key: str = "y_binary"
) -> tuple[np.ndarray, np.ndarray]:
    """Sigmoid probabilities and integer labels for every sample in ``loader``."""
    model.eval()
    probs, labels = [], []
    for batch in loader:
        logits = model(batch["X"].to(device)).float().cpu()
        probs.append(torch.sigmoid(logits).numpy().ravel())
        labels.append(batch[label_key].numpy().ravel())
    return np.concatenate(probs), np.concatenate(labels).astype(int)


def sweep_threshold(
    probs: np.ndarray,
    labels: np.ndarray,
    precision_floor: float = 0.20,
    grid: np.ndarray | None = None,
) -> tuple[float, float]:
    """Pick the threshold maximising F1 subject to a minimum precision.

    Returns ``(threshold, f1)``; falls back to ``(0.5, -1.0)`` if no threshold clears
    the precision floor.
    """
    grid = np.arange(0.05, 0.96, 0.05) if grid is None else grid
    best_t, best_f1 = 0.5, -1.0
    for t in grid:
        preds = (probs >= t).astype(int)
        if precision_score(labels, preds, zero_division=0) < precision_floor:
            continue
        f1 = f1_score(labels, preds, zero_division=0)
        if f1 > best_f1:
            best_t, best_f1 = float(t), float(f1)
    return best_t, best_f1


@dataclass
class TrainResult:
    model: nn.Module
    threshold: float
    history: dict[str, list[float]] = field(default_factory=dict)
    checkpoint: Path | None = None


def _run_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    optimiser: torch.optim.Optimizer | None,
    scaler: Any | None,
    amp: bool,
    grad_clip: float,
) -> float:
    train = optimiser is not None
    model.train(train)
    total, n = 0.0, 0
    with torch.set_grad_enabled(train):
        for batch in loader:
            x = batch["X"].to(device, non_blocking=True)
            y = batch["y_binary"].to(device, non_blocking=True).unsqueeze(1)
            with torch.autocast(device_type=device.type, enabled=amp):
                loss = criterion(model(x), y)
            if not torch.isfinite(loss):
                continue
            if train:
                assert optimiser is not None
                optimiser.zero_grad(set_to_none=True)
                if scaler is not None and amp:
                    scaler.scale(loss).backward()
                    scaler.unscale_(optimiser)
                    nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
                    scaler.step(optimiser)
                    scaler.update()
                else:
                    loss.backward()
                    nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
                    optimiser.step()
            total += loss.item()
            n += 1
    return total / max(n, 1)


def train_binary(
    exercise: str,
    class_idx: int,
    labels: dict[str, RepLabel],
    splits: dict[str, list[str]],
    pose_dir: Path | str,
    cfg: Config | None = None,
    checkpoint_dir: Path | str | None = None,
    device: str | torch.device = "auto",
    use_amp: bool = True,
    num_workers: int | None = None,
    log_every: int = 10,
) -> TrainResult:
    """Train a single-output ``ExerciseTCN`` for ``error_names(exercise)[class_idx]``."""
    cfg = cfg or Config()
    seed_everything(cfg.seed)
    dev = resolve_device(device)
    class_name = error_names(exercise)[class_idx]
    log.info("training %s/%s on %s", exercise, class_name, dev)

    ds_kwargs: dict[str, Any] = {
        "fixed_len": cfg.fixed_len,
        "use_angles": cfg.use_angles,
        "use_velocity": cfg.use_velocity,
        "seed": cfg.seed,
    }
    loaders = {
        split: make_binary_dataloader(
            split,
            splits[split],
            labels,
            pose_dir,
            target_class_idx=class_idx,
            batch_size=cfg.batch_size,
            num_workers=num_workers,
            **ds_kwargs,
        )
        for split in ("train", "val")
    }
    for split, loader in loaders.items():
        if len(loader.dataset) == 0:  # type: ignore[arg-type]
            raise ValueError(f"{exercise}/{class_name}: {split} split has no usable samples")

    model = build_model(cfg, n_error_classes=1).to(dev)
    log.info("model parameters: %s", f"{count_parameters(model):,}")

    criterion = nn.BCEWithLogitsLoss()
    optimiser = torch.optim.AdamW(model.parameters(), lr=cfg.lr, weight_decay=cfg.weight_decay)
    scheduler = ReduceLROnPlateau(
        optimiser, patience=cfg.scheduler_patience, factor=cfg.scheduler_factor
    )
    amp = use_amp and dev.type == "cuda"
    scaler = _make_grad_scaler() if amp else None
    stopper = EarlyStopping(patience=cfg.patience)
    history: dict[str, list[float]] = {"train_loss": [], "val_loss": [], "lr": []}

    for epoch in range(1, cfg.max_epochs + 1):
        t0 = time.time()
        tr_loss = _run_epoch(
            model, loaders["train"], criterion, dev, optimiser, scaler, amp, cfg.grad_clip
        )
        vl_loss = _run_epoch(model, loaders["val"], criterion, dev, None, None, amp, cfg.grad_clip)
        if math.isnan(tr_loss) or math.isnan(vl_loss):
            log.warning("NaN loss at epoch %d, stopping", epoch)
            break
        scheduler.step(vl_loss)
        lr_now = optimiser.param_groups[0]["lr"]
        history["train_loss"].append(tr_loss)
        history["val_loss"].append(vl_loss)
        history["lr"].append(lr_now)
        if epoch == 1 or epoch % log_every == 0:
            log.info(
                "epoch %3d  train=%.4f  val=%.4f  lr=%.2e  (%.1fs)",
                epoch, tr_loss, vl_loss, lr_now, time.time() - t0,
            )  # fmt: skip
        if stopper.step(vl_loss, model):
            log.info("early stopping at epoch %d (best val=%.4f)", epoch, stopper.best)
            break
    stopper.restore_best(model)

    probs, y = collect_probs(model, loaders["val"], dev)
    threshold, best_f1 = sweep_threshold(probs, y, cfg.precision_floor)
    log.info("validation threshold=%.2f (F1=%.3f)", threshold, best_f1)

    result = TrainResult(model=model, threshold=threshold, history=history)
    if checkpoint_dir is not None:
        result.checkpoint = save_checkpoint(
            checkpoint_path(checkpoint_dir, exercise, class_name),
            model, cfg, exercise, class_name, class_idx, threshold, history,
        )  # fmt: skip
        log.info("saved %s", result.checkpoint)
    return result
