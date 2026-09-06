"""Dataset-level exploratory analysis: class balance and score distributions."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from exercise_advisor.data.labels import RepLabel, class_balance, error_names


def subject_stats(labels: dict[str, RepLabel]) -> dict[str, float]:
    per_subject: dict[str, int] = {}
    for r in labels.values():
        per_subject[r.subject_id] = per_subject.get(r.subject_id, 0) + 1
    counts = list(per_subject.values())
    return {
        "n_subjects": len(per_subject),
        "reps_min": min(counts) if counts else 0,
        "reps_max": max(counts) if counts else 0,
        "reps_mean": float(np.mean(counts)) if counts else 0.0,
    }


def plot_dataset_analysis(all_labels: dict[str, dict[str, RepLabel]], path: Path | str) -> Path:
    """Two rows per exercise: class balance bars and quality-score histogram."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    exercises = list(all_labels)
    fig, axes = plt.subplots(2, len(exercises), figsize=(5.5 * len(exercises), 9), squeeze=False)
    fig.suptitle("Fitness-AQA dataset analysis", fontsize=14, fontweight="bold")

    for col, exercise in enumerate(exercises):
        labels = all_labels[exercise]
        names = error_names(exercise)
        rows = class_balance(labels, exercise)
        x = np.arange(len(names))

        ax = axes[0, col]
        ax.bar(x - 0.2, [r["n_neg"] for r in rows], 0.4, label="clean")
        ax.bar(x + 0.2, [r["n_pos"] for r in rows], 0.4, label="error")
        ax.set_xticks(x)
        ax.set_xticklabels(names, rotation=20, ha="right", fontsize=8)
        ax.set_title(f"{exercise} - class balance")
        ax.set_ylabel("# reps")
        ax.legend(fontsize=8)
        for xi, r in zip(x, rows, strict=True):
            ax.text(xi + 0.2, r["n_pos"] + 5, f"{100 * r['n_pos'] / max(len(labels), 1):.0f}%",
                    ha="center", fontsize=7)  # fmt: skip

        ax = axes[1, col]
        scores = [r.score for r in labels.values()]
        ax.hist(scores, bins=20, edgecolor="white", alpha=0.85)
        ax.axvline(float(np.mean(scores)), linestyle="--", linewidth=1.5,
                   label=f"mean={np.mean(scores):.2f}")  # fmt: skip
        ax.set_title(f"{exercise} - quality score")
        ax.set_xlabel("score (0 = all errors, 1 = clean)")
        ax.set_ylabel("# reps")
        ax.legend(fontsize=8)

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(path, dpi=120, bbox_inches="tight")
    plt.close(fig)
    return path
