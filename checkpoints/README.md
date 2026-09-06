# Trained checkpoints

One binary `ExerciseTCN` per error class, trained on the official Fitness-AQA subject-level
splits with the default `Config` (`hidden_dim=128`, `n_layers=6`, `dropout=0.3`, 222 input
features, 100-frame sequences).

| File | Exercise | Error class | Val. threshold | Epochs |
|---|---|---|---:|---:|
| `OHP_error_elbows.pt` | Overhead press | Elbow flare | 0.05 | 60 |
| `OHP_error_knees.pt` | Overhead press | Knee bend | 0.55 | 75 |
| `Squat_knees_inward.pt` | Back squat | Knee valgus | 0.55 | 47 |
| `Squat_knees_forward.pt` | Back squat | Forward knee travel | 0.20 | 62 |
| `Squat_shallow_depth.pt` | Back squat | Shallow depth | 0.05 | 35 |
| `BarbellRow_lumbar_error.pt` | Barbell row | Lumbar rounding | 0.55 | 61 |
| `BarbellRow_torso_angle.pt` | Barbell row | Torso too upright | 0.50 | 31 |

Each file is a plain dictionary loadable with `torch.load(path, weights_only=True)`:

```python
from exercise_advisor.models import load_checkpoint

model, meta = load_checkpoint("checkpoints/OHP_error_knees.pt")
meta["threshold"], meta["config"], meta["history"]["val_loss"][:3]
```

Checkpoints were produced by the research notebook and converted with
`scripts/convert_legacy_checkpoints.py`; the loss curves are stored under `history`.
See [`docs/results.md`](../docs/results.md) for test-set metrics.
