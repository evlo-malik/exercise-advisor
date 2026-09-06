"""Combine per-class binary models into multi-label predictions and score them."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import torch
from scipy.stats import spearmanr
from sklearn.metrics import (
    f1_score,
    mean_absolute_error,
    precision_score,
    recall_score,
    roc_auc_score,
)
from torch import nn
from torch.utils.data import DataLoader

log = logging.getLogger(__name__)


@dataclass
class EvaluationResult:
    exercise: str
    split: str
    error_names: list[str]
    rep_keys: np.ndarray
    true_labels: np.ndarray  # (N, C) int
    pred_probs: np.ndarray  # (N, C) float
    pred_labels: np.ndarray  # (N, C) int
    true_scores: np.ndarray  # (N,)
    derived_scores: np.ndarray  # (N,) = 1 - mean(pred_probs)
    thresholds: dict[str, float]

    @property
    def per_class(self) -> list[dict[str, Any]]:
        return per_class_metrics(self)

    @property
    def macro_f1(self) -> float:
        return float(f1_score(self.true_labels, self.pred_labels, average="macro", zero_division=0))

    @property
    def spearman(self) -> float:
        rho = spearmanr(self.true_scores, self.derived_scores).statistic
        return float(rho) if rho == rho else float("nan")

    @property
    def mae(self) -> float:
        return float(mean_absolute_error(self.true_scores, self.derived_scores))

    def summary(self) -> dict[str, Any]:
        return {
            "exercise": self.exercise,
            "split": self.split,
            "n_samples": len(self.rep_keys),
            "macro_f1": self.macro_f1,
            "spearman_rho": self.spearman,
            "mae": self.mae,
            "per_class": self.per_class,
        }

    def as_markdown(self) -> str:
        lines = [
            f"### {self.exercise} ({self.split}, n={len(self.rep_keys)})",
            "",
            "| Error class | Precision | Recall | F1 | ROC-AUC | Threshold | #Pos | #Neg |",
            "|---|---:|---:|---:|---:|---:|---:|---:|",
        ]
        for m in self.per_class:
            lines.append(
                f"| `{m['error']}` | {m['precision']:.3f} | {m['recall']:.3f} | {m['f1']:.3f} "
                f"| {m['auc']:.3f} | {m['threshold']:.2f} | {m['n_pos']} | {m['n_neg']} |"
            )
        lines += [
            "",
            f"Macro F1 **{self.macro_f1:.3f}** | Spearman rho **{self.spearman:.3f}** "
            f"| score MAE **{self.mae:.3f}**",
        ]
        return "\n".join(lines)


def per_class_metrics(result: EvaluationResult) -> list[dict[str, Any]]:
    rows = []
    for i, name in enumerate(result.error_names):
        y, p, prob = result.true_labels[:, i], result.pred_labels[:, i], result.pred_probs[:, i]
        try:
            auc = float(roc_auc_score(y, prob))
        except ValueError:
            auc = float("nan")
        rows.append(
            {
                "error": name,
                "precision": float(precision_score(y, p, zero_division=0)),
                "recall": float(recall_score(y, p, zero_division=0)),
                "f1": float(f1_score(y, p, zero_division=0)),
                "auc": auc,
                "threshold": float(result.thresholds.get(name, 0.5)),
                "n_pos": int(y.sum()),
                "n_neg": int(len(y) - y.sum()),
            }
        )
    return rows


@torch.no_grad()
def predict_multilabel(
    models: Mapping[str, nn.Module],
    thresholds: Mapping[str, float],
    loader: DataLoader,
    error_names: list[str],
    device: torch.device | str = "cpu",
    exercise: str = "",
    split: str = "test",
) -> EvaluationResult:
    """Run every per-class model over ``loader`` and stack into ``(N, C)`` arrays."""
    dev = torch.device(device)
    probs_by_class: dict[str, list[np.ndarray]] = {name: [] for name in error_names}
    true_labels, true_scores, keys = [], [], []

    for batch in loader:
        x = batch["X"].to(dev)
        true_labels.append(batch["y_errors"].numpy().astype(int))
        true_scores.append(batch["y_score"].numpy())
        keys.extend(batch["rep_key"])
        for name in error_names:
            model = models[name].to(dev).eval()
            probs_by_class[name].append(torch.sigmoid(model(x)).float().cpu().numpy().ravel())

    pred_probs = np.stack([np.concatenate(probs_by_class[n]) for n in error_names], axis=1)
    pred_labels = np.stack(
        [(pred_probs[:, i] >= thresholds.get(n, 0.5)) for i, n in enumerate(error_names)], axis=1
    ).astype(int)
    return EvaluationResult(
        exercise=exercise,
        split=split,
        error_names=list(error_names),
        rep_keys=np.array(keys),
        true_labels=np.concatenate(true_labels),
        pred_probs=pred_probs.astype(np.float32),
        pred_labels=pred_labels,
        true_scores=np.concatenate(true_scores),
        derived_scores=(1.0 - pred_probs.mean(axis=1)).astype(np.float32),
        thresholds=dict(thresholds),
    )


def evaluate_exercise(
    models: Mapping[str, nn.Module],
    thresholds: Mapping[str, float],
    loader: DataLoader,
    error_names: list[str],
    exercise: str,
    split: str = "test",
    device: torch.device | str = "cpu",
    plot_path: Path | str | None = None,
) -> EvaluationResult:
    """Predict, log a metrics table and optionally save a summary figure."""
    result = predict_multilabel(models, thresholds, loader, error_names, device, exercise, split)
    log.info("\n%s", result.as_markdown())
    if plot_path is not None:
        plot_evaluation(result, plot_path)
    return result


def plot_evaluation(result: EvaluationResult, path: Path | str) -> Path:
    """Score-correlation scatter and per-class AUC bars."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    fig.suptitle(f"{result.exercise} [{result.split}] - per-class binary classifiers")

    ax1.scatter(result.true_scores, result.derived_scores, alpha=0.4, s=15)
    lo = float(min(result.true_scores.min(), result.derived_scores.min()))
    hi = float(max(result.true_scores.max(), result.derived_scores.max()))
    ax1.plot([lo, hi], [lo, hi], "r--", linewidth=1)
    ax1.set_xlabel("True score")
    ax1.set_ylabel("Derived score")
    ax1.set_title(f"Score correlation (rho={result.spearman:.3f})")

    aucs = [m["auc"] for m in result.per_class]
    bars = ax2.bar(result.error_names, aucs)
    ax2.axhline(0.5, color="red", linestyle="--", linewidth=1, label="chance")
    ax2.set_ylim(0, 1)
    ax2.set_ylabel("ROC-AUC")
    ax2.set_title("Per-class AUC")
    ax2.legend()
    for bar, v in zip(bars, aucs, strict=True):
        ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02, f"{v:.2f}",
                 ha="center", va="bottom", fontsize=9)  # fmt: skip

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(path, dpi=120, bbox_inches="tight")
    plt.close(fig)
    return path


def plot_loss_curves(
    histories: dict[str, dict[str, list[float]]], exercise: str, path: Path | str
) -> Path:
    """One panel per error class with train / val BCE curves."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    n = len(histories)
    fig, axes = plt.subplots(1, n, figsize=(5 * n, 3), squeeze=False)
    fig.suptitle(f"{exercise} - per-class binary loss curves")
    for ax, (name, hist) in zip(axes[0], histories.items(), strict=True):
        ax.plot(hist.get("train_loss", []), label="train")
        ax.plot(hist.get("val_loss", []), label="val")
        ax.set_title(name)
        ax.set_xlabel("epoch")
        ax.set_ylabel("BCE")
        ax.legend()
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(path, dpi=120, bbox_inches="tight")
    plt.close(fig)
    return path
