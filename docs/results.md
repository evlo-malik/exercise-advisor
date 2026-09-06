# Results

Metrics on the official **test** splits for the checkpoints in `checkpoints/`. Thresholds
were tuned on the validation split (max F1 with precision >= 0.20). Numbers come from the
final evaluation cell of the research notebook.

## Per-class binary classification

| Exercise | Error class | Precision | Recall | F1 | ROC-AUC | Threshold | #Pos | #Neg |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| OHP | `error_elbows` | 0.254 | 1.000 | 0.405 | 0.656 | 0.05 | 86 | 253 |
| OHP | `error_knees` | 0.713 | 0.602 | **0.653** | **0.802** | 0.55 | 128 | 211 |
| Squat | `knees_inward` | 0.268 | 0.306 | 0.286 | 0.621 | 0.55 | 36 | 207 |
| Squat | `knees_forward` | 0.693 | 0.994 | **0.817** | 0.630 | 0.20 | 168 | 75 |
| Squat | `shallow_depth` | 0.284 | 1.000 | 0.442 | 0.515 | 0.05 | 69 | 174 |
| BarbellRow | `lumbar_error` | 0.457 | 0.272 | 0.341 | 0.655 | 0.55 | 390 | 1,801 |
| BarbellRow | `torso_angle` | 0.140 | 0.107 | 0.121 | 0.584 | 0.50 | 224 | 1,967 |

## Exercise-level summary

| Exercise | Macro F1 | Spearman rho (score) | Score MAE | Test reps |
|---|---:|---:|---:|---:|
| OHP | 0.529 | 0.336 | 0.368 | 339 |
| Squat | 0.515 | 0.117 | 0.255 | 243 |
| BarbellRow | 0.231 | 0.067 | 0.312 | 2,191 |

## Reading the numbers honestly

**What works.** OHP knee bend (AUC 0.80) and Squat forward knee travel (F1 0.82) are
detected reliably. Both are gross, whole-body movements that a hip-centred, shoulder-scaled
skeleton captures well, and both have enough positives to learn from.

**Threshold collapse.** Three classes (`error_elbows`, `shallow_depth` and, to a lesser
extent, `knees_forward`) ended up with very low thresholds (0.05 to 0.20) and recall near
1.0. The validation sweep found that flagging almost everything maximised F1 once the
precision floor was met. Those models are effectively "always alarm" detectors and should
be read as such; a precision floor above 0.20 or optimising for a different operating
point would trade recall for usefulness.

**Subtle errors are hard from 2-D landmarks.** Knee valgus (`knees_inward`, 36 test
positives) and shallow depth are small angular changes, often in the depth direction, that
MediaPipe's pseudo-`z` does not measure accurately. Their AUCs (0.62 and 0.52) are close
to chance.

**BarbellRow is single-frame.** Barbell row samples are individual `.jpg` frames, so the
"sequence" is one pose repeated 100 times with zero velocity. The temporal model has
nothing temporal to learn from, and `torso_angle` in particular (AUC 0.58) is close to
chance. A single-frame model with explicit torso-angle and spine-curvature features would
be a far better fit for this exercise.

**Score correlation is weak.** The derived score is an average of noisy probabilities,
and the ground-truth score is itself a heuristic built from interval durations. Spearman
correlations of 0.07 to 0.34 mean the score is a coarse signal; the per-error flags carry
most of the useful information.

## Ideas that would most likely move these numbers

1. **Per-exercise feature sets**: explicit torso angle, spine curvature and bar path for
   the row; knee-to-toe and hip-crease-below-knee geometry for the squat.
2. **A different operating point**: report precision-recall curves and let the
   application pick the threshold instead of hard-coding max-F1.
3. **Frame-level supervision**: the interval labels say *when* an error happens. Training
   on per-frame targets (or with the attention weights supervised by the intervals) uses
   far more signal than one bit per rep.
4. **3-D pose or multi-view input** for the depth-direction errors.
5. **Self-supervised pretraining** on the unlabelled portion of Fitness-AQA, as in the
   original paper.

## Reproducing

```bash
export FITNESS_AQA_ROOT=/path/to/Fitness-AQA_dataset_release
exercise-advisor extract --exercise all
exercise-advisor train --exercise all         # ~1 hour per exercise on a single GPU
exercise-advisor evaluate --exercise all      # writes outputs/metrics_test.json + plots
```

Training is seeded (`Config.seed = 42`) but GPU non-determinism and augmentation mean
results will vary by a few points between runs.
