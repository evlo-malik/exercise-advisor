# Contributing

Thanks for taking the time to contribute. This document explains how the project is laid
out and what a good pull request looks like.

## Development setup

```bash
git clone https://github.com/evlo-malik/exercise-advisor.git
cd exercise-advisor
python -m venv .venv && source .venv/bin/activate
make install          # pip install -e ".[dev]"
make install-pose     # optional: MediaPipe + OpenCV for video inference
pre-commit install    # optional: run ruff on every commit
```

Run everything CI runs:

```bash
make check            # ruff + mypy + pytest
```

`make test-fast` skips the slow tests (a tiny end-to-end training run and the shipped
checkpoint checks).

## Project layout

| Path | What lives there |
|---|---|
| `src/exercise_advisor/` | The Python package (see the module docstrings for a tour) |
| `tests/` | Pytest suite; a synthetic Fitness-AQA release is generated in `conftest.py` |
| `checkpoints/` | Trained per-class models in the versioned checkpoint format |
| `notebooks/` | The original research notebook, kept as an experiment log |
| `scripts/` | One-off utilities (legacy checkpoint conversion) |
| `docs/` | Architecture, dataset and results write-ups |
| `web/` | The Next.js project website |

## Guidelines

- **Tests first for behaviour changes.** Every module under `src/` has a matching
  `tests/test_*.py`; extend it rather than adding ad-hoc scripts.
- **No dataset content in the repo.** The Fitness-AQA videos and frames show real people
  and are licensed for research only. Never commit videos, frames, extracted poses or
  notebook outputs that render them.
- **Keep checkpoints loadable with `weights_only=True`.** Only tensors, numbers, strings,
  lists and dicts belong in a checkpoint. Bump `CHECKPOINT_FORMAT_VERSION` if the layout
  changes and add a converter to `scripts/`.
- **Style** is enforced by `ruff` (line length 100) and `mypy`. Public functions get type
  hints and a one-line docstring.
- **Commits** should be small and descriptive. Reference the issue you are addressing.

## Reporting results

If you retrain models, run `exercise-advisor evaluate --exercise all` and paste the
generated markdown tables into your pull request so reviewers can compare against
`docs/results.md`.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
