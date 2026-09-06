# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-09-06

### Added
- `exercise_advisor` Python package extracted from the research notebook: label loading,
  subject-aware splits, landmark augmentation, feature engineering, the `ExerciseTCN`
  model, per-class binary training with validation threshold tuning, multi-label
  evaluation and the `AQAPredictor` inference class.
- `exercise-advisor` CLI (`analyze`, `verify-splits`, `extract`, `train`, `evaluate`,
  `predict`).
- Versioned, `weights_only`-safe checkpoint format plus `scripts/convert_legacy_checkpoints.py`.
- Seven trained per-class checkpoints (OHP x2, Squat x3, BarbellRow x2).
- Pytest suite with a synthetic Fitness-AQA release fixture; ruff, mypy and GitHub Actions CI.
- Documentation: architecture, dataset and results write-ups.
- Project website moved to `web/`.

### Changed
- Repository merged from the I-Explore ML project code and the standalone website repo.
- Notebook paths made portable via environment variables; prediction-example images
  removed from notebook outputs because they show dataset subjects.

### Removed
- Git LFS pointers for extracted poses (dataset-derived data is not distributed).
- Legacy multi-label checkpoints from the abandoned dual-head approach.
