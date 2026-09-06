import torch

from exercise_advisor.config import Config
from exercise_advisor.models.checkpoint import (
    build_model,
    checkpoint_path,
    load_checkpoint,
    save_checkpoint,
)
from exercise_advisor.models.tcn import CausalConv1dBlock, ExerciseTCN, count_parameters


def test_forward_shape_and_receptive_field():
    model = ExerciseTCN(input_dim=222, n_error_classes=3, hidden_dim=16, n_layers=3)
    x = torch.randn(5, 100, 222)
    assert model(x).shape == (5, 3)
    assert model.receptive_field == 1 + 2 * 2 * (1 + 2 + 4)
    assert model.attention(x).shape == (5, 100)
    assert torch.allclose(model.attention(x).sum(dim=1), torch.ones(5), atol=1e-5)


def test_shipped_architecture_parameter_count():
    model = build_model(Config())
    assert count_parameters(model) == 647_938
    assert model.receptive_field == 253  # covers the full 100-frame rep


def test_causal_block_does_not_leak_future():
    block = CausalConv1dBlock(4, 4, kernel_size=3, dilation=2, dropout=0.0).eval()
    x = torch.randn(1, 4, 20)
    y1 = block(x)
    x2 = x.clone()
    x2[:, :, 15:] += 10.0  # perturb only the future
    y2 = block(x2)
    assert torch.allclose(y1[:, :, :15], y2[:, :, :15], atol=1e-5)
    assert not torch.allclose(y1[:, :, 15:], y2[:, :, 15:])


def test_checkpoint_roundtrip(tmp_path, tiny_config):
    model = build_model(tiny_config)
    path = save_checkpoint(
        checkpoint_path(tmp_path, "OHP", "error_knees"),
        model, tiny_config, "OHP", "error_knees", 1, 0.35, {"val_loss": [0.7, 0.6]},
    )  # fmt: skip
    assert path.name == "OHP_error_knees.pt"

    loaded, meta = load_checkpoint(path)
    assert meta["threshold"] == 0.35
    assert meta["class_idx"] == 1
    assert meta["config"] == tiny_config
    assert meta["history"]["val_loss"] == [0.7, 0.6]
    assert not loaded.training
    x = torch.randn(2, tiny_config.fixed_len, tiny_config.feature_dim)
    assert torch.allclose(model.eval()(x), loaded(x))


def test_checkpoint_is_weights_only_safe(tmp_path, tiny_config):
    path = save_checkpoint(
        tmp_path / "m.pt", build_model(tiny_config), tiny_config, "OHP", "e", 0, 0.5
    )
    payload = torch.load(path, weights_only=True)
    assert payload["format_version"] == 1
