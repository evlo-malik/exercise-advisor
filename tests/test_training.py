import numpy as np
import pytest
import torch

from exercise_advisor.data.datasets import make_dataloader
from exercise_advisor.data.labels import error_names, load_exercise_labels, load_splits
from exercise_advisor.models.checkpoint import load_checkpoint
from exercise_advisor.training.evaluation import evaluate_exercise, predict_multilabel
from exercise_advisor.training.trainer import EarlyStopping, sweep_threshold, train_binary


def test_sweep_threshold_prefers_high_f1():
    probs = np.array([0.1, 0.2, 0.8, 0.9, 0.6, 0.3])
    labels = np.array([0, 0, 1, 1, 1, 0])
    t, f1 = sweep_threshold(probs, labels, precision_floor=0.2)
    assert 0.3 < t <= 0.6
    assert f1 == pytest.approx(1.0)


def test_sweep_threshold_falls_back_when_floor_unmet():
    probs = np.array([0.9, 0.9, 0.9, 0.9, 0.9])
    labels = np.array([0, 0, 0, 0, 0])
    assert sweep_threshold(probs, labels, precision_floor=0.5) == (0.5, -1.0)


def test_early_stopping_restores_best():
    model = torch.nn.Linear(2, 1)
    stopper = EarlyStopping(patience=2)
    assert not stopper.step(1.0, model)
    best = {k: v.clone() for k, v in model.state_dict().items()}
    with torch.no_grad():
        model.weight.add_(1.0)
    assert not stopper.step(1.5, model)
    assert stopper.step(1.5, model)
    stopper.restore_best(model)
    assert torch.equal(model.weight, best["weight"])


@pytest.mark.slow
def test_train_evaluate_roundtrip(synthetic_dataset, tiny_config):
    exercise = "OHP"
    labels = load_exercise_labels(exercise, synthetic_dataset.dataset_root)
    splits = load_splits(exercise, synthetic_dataset.dataset_root)
    pose_dir = synthetic_dataset.pose_dir(exercise)

    models, thresholds = {}, {}
    for idx, name in enumerate(error_names(exercise)):
        result = train_binary(
            exercise, idx, labels, splits, pose_dir, tiny_config,
            checkpoint_dir=synthetic_dataset.checkpoint_dir, device="cpu", num_workers=0,
        )  # fmt: skip
        assert len(result.history["val_loss"]) == tiny_config.max_epochs
        assert result.checkpoint is not None and result.checkpoint.exists()
        models[name], meta = load_checkpoint(result.checkpoint)
        thresholds[name] = meta["threshold"]

    loader = make_dataloader(
        "test", splits["test"], labels, pose_dir, batch_size=4, num_workers=0,
        fixed_len=tiny_config.fixed_len,
    )  # fmt: skip
    result = evaluate_exercise(
        models, thresholds, loader, error_names(exercise), exercise, "test",
        plot_path=synthetic_dataset.output_dir / "eval.png",
    )  # fmt: skip
    n = len(splits["test"])
    assert result.pred_probs.shape == (n, 2)
    assert result.pred_labels.shape == (n, 2)
    assert set(np.unique(result.pred_labels)) <= {0, 1}
    assert np.allclose(result.derived_scores, 1 - result.pred_probs.mean(axis=1))
    assert 0.0 <= result.macro_f1 <= 1.0
    assert (synthetic_dataset.output_dir / "eval.png").exists()
    md = result.as_markdown()
    assert "error_elbows" in md and "Macro F1" in md
    assert {m["error"] for m in result.summary()["per_class"]} == set(error_names(exercise))


def test_predict_multilabel_thresholds_applied(synthetic_dataset, tiny_config):
    from exercise_advisor.models.checkpoint import build_model

    exercise = "BarbellRow"
    labels = load_exercise_labels(exercise, synthetic_dataset.dataset_root)
    splits = load_splits(exercise, synthetic_dataset.dataset_root)
    loader = make_dataloader(
        "val", splits["val"], labels, synthetic_dataset.pose_dir(exercise), batch_size=8,
        num_workers=0, fixed_len=tiny_config.fixed_len,
    )  # fmt: skip
    names = error_names(exercise)
    models = {n: build_model(tiny_config).eval() for n in names}
    low = predict_multilabel(models, dict.fromkeys(names, 0.0), loader, names)
    high = predict_multilabel(models, dict.fromkeys(names, 1.01), loader, names)
    assert low.pred_labels.all()
    assert not high.pred_labels.any()
