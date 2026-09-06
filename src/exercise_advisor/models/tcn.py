"""Temporal Convolutional Network for rep-level error classification.

::

    (B, T, F) --Linear--> (B, T, H) --transpose--> (B, H, T)
        --> [CausalConv1dBlock x n_layers, dilation 1, 2, 4, ...]
        --> AttentionPool over T --> (B, H) --> MLP head --> logits (B, n_classes)

With ``n_layers=6`` and ``kernel_size=3`` the receptive field is
``1 + 2 * (3 - 1) * (1 + 2 + 4 + 8 + 16 + 32) = 253`` frames, so the last block sees
the entire 100-frame rep.
"""

from __future__ import annotations

import torch
import torch.nn.functional as F
from torch import Tensor, nn


class CausalConv1dBlock(nn.Module):
    """Residual block of two dilated causal convolutions with BatchNorm and dropout."""

    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        kernel_size: int = 3,
        dilation: int = 1,
        dropout: float = 0.3,
    ) -> None:
        super().__init__()
        self.pad = (kernel_size - 1) * dilation
        self.conv1 = nn.Conv1d(
            in_channels, out_channels, kernel_size, padding=self.pad, dilation=dilation
        )
        self.conv2 = nn.Conv1d(
            out_channels, out_channels, kernel_size, padding=self.pad, dilation=dilation
        )
        self.norm1 = nn.BatchNorm1d(out_channels)
        self.norm2 = nn.BatchNorm1d(out_channels)
        self.drop = nn.Dropout(dropout)
        self.shortcut: nn.Module = (
            nn.Conv1d(in_channels, out_channels, 1)
            if in_channels != out_channels
            else nn.Identity()
        )

    def _causal_trim(self, x: Tensor) -> Tensor:
        """Drop the right-hand padding so no time step sees the future."""
        return x[:, :, : -self.pad] if self.pad > 0 else x

    def forward(self, x: Tensor) -> Tensor:
        residual = self.shortcut(x)
        out = self.drop(F.relu(self.norm1(self._causal_trim(self.conv1(x)))))
        out = self.drop(F.relu(self.norm2(self._causal_trim(self.conv2(out)))))
        return F.relu(out + residual)


class AttentionPool(nn.Module):
    """Learned soft attention over time: focus on the frames where an error shows."""

    def __init__(self, hidden_dim: int, attn_dim: int = 64) -> None:
        super().__init__()
        self.attn = nn.Sequential(
            nn.Linear(hidden_dim, attn_dim), nn.Tanh(), nn.Linear(attn_dim, 1)
        )

    def forward(self, x: Tensor, return_weights: bool = False) -> Tensor | tuple[Tensor, Tensor]:
        x_t = x.transpose(1, 2)  # (B, T, H)
        weights = torch.softmax(self.attn(x_t).squeeze(-1), dim=1)  # (B, T)
        pooled = (x_t * weights.unsqueeze(-1)).sum(dim=1)  # (B, H)
        return (pooled, weights) if return_weights else pooled


class ExerciseTCN(nn.Module):
    """Classification-only TCN. Outputs raw logits; apply ``sigmoid`` for probabilities."""

    def __init__(
        self,
        input_dim: int,
        n_error_classes: int = 1,
        hidden_dim: int = 128,
        n_layers: int = 6,
        kernel_size: int = 3,
        dropout: float = 0.3,
    ) -> None:
        super().__init__()
        self.input_dim = input_dim
        self.n_error_classes = n_error_classes
        self.input_proj = nn.Linear(input_dim, hidden_dim)
        self.tcn = nn.Sequential(
            *[
                CausalConv1dBlock(hidden_dim, hidden_dim, kernel_size, 2**i, dropout)
                for i in range(n_layers)
            ]
        )
        self.attn_pool = AttentionPool(hidden_dim)
        self.cls_head = nn.Sequential(
            nn.Linear(hidden_dim, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, n_error_classes),
        )
        self._init_weights()

    def _init_weights(self) -> None:
        for m in self.modules():
            if isinstance(m, (nn.Conv1d, nn.Linear)):
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    @property
    def receptive_field(self) -> int:
        blocks = [m for m in self.tcn if isinstance(m, CausalConv1dBlock)]
        return 1 + sum(2 * b.pad for b in blocks)

    def forward(self, x: Tensor) -> Tensor:
        """``x``: ``(B, T, F)`` -> logits ``(B, n_error_classes)``."""
        h = self.input_proj(x).transpose(1, 2)  # (B, H, T)
        h = self.tcn(h)
        return self.cls_head(self.attn_pool(h))

    @torch.no_grad()
    def attention(self, x: Tensor) -> Tensor:
        """Per-frame attention weights ``(B, T)`` for interpretability."""
        h = self.tcn(self.input_proj(x).transpose(1, 2))
        _, weights = self.attn_pool(h, return_weights=True)
        return weights


def count_parameters(model: nn.Module) -> int:
    return sum(p.numel() for p in model.parameters() if p.requires_grad)
