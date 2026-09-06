"""Command-line interface: ``exercise-advisor <command> [options]``.

Commands
--------
``analyze``        class balance, subject statistics and the dataset-analysis figure
``verify-splits``  check the official splits for subject leakage
``extract``        cache MediaPipe landmarks for every labelled rep
``train``          train one binary TCN per error class
``evaluate``       evaluate cached checkpoints on a split and write metrics JSON
``predict``        score a single-rep video and print coaching feedback
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

import torch

from exercise_advisor import __version__
from exercise_advisor.config import Config, Paths
from exercise_advisor.data.labels import EXERCISE_NAMES, class_balance, error_names
from exercise_advisor.data.labels import load_exercise_labels as _load_labels
from exercise_advisor.data.labels import load_splits as _load_splits

log = logging.getLogger("exercise_advisor")


def _exercises(arg: str) -> list[str]:
    return list(EXERCISE_NAMES) if arg == "all" else [arg]


def _add_common(p: argparse.ArgumentParser) -> None:
    p.add_argument(
        "--exercise", default="all", choices=[*EXERCISE_NAMES, "all"], help="exercise to process"
    )
    p.add_argument("--dataset-root", type=Path, default=None, help="Fitness-AQA release root")
    p.add_argument("--pose-root", type=Path, default=None, help="cached landmark .npy root")
    p.add_argument("--checkpoint-dir", type=Path, default=None)
    p.add_argument("--output-dir", type=Path, default=None)


def _paths(args: argparse.Namespace) -> Paths:
    paths = Paths()
    if getattr(args, "dataset_root", None):
        paths.dataset_root = args.dataset_root
    if getattr(args, "pose_root", None):
        paths.pose_root = args.pose_root
    if getattr(args, "checkpoint_dir", None):
        paths.checkpoint_dir = args.checkpoint_dir
    if getattr(args, "output_dir", None):
        paths.output_dir = args.output_dir
    return paths


def cmd_analyze(args: argparse.Namespace) -> int:
    from exercise_advisor.analysis import plot_dataset_analysis, subject_stats

    paths = _paths(args)
    all_labels = {ex: _load_labels(ex, paths.dataset_root) for ex in _exercises(args.exercise)}
    for ex, labels in all_labels.items():
        stats = subject_stats(labels)
        print(
            f"\n{ex}: {len(labels)} reps, {stats['n_subjects']} subjects "
            f"(reps/subject {stats['reps_min']}-{stats['reps_max']}, "
            f"mean {stats['reps_mean']:.1f})"
        )
        for row in class_balance(labels, ex):
            flag = "  <- high imbalance" if row["ratio"] > 4 else ""
            print(f"  {row['error']:<16} pos={row['n_pos']:>5}  neg={row['n_neg']:>5}  "
                  f"neg:pos={row['ratio']:.1f}{flag}")  # fmt: skip
    out = plot_dataset_analysis(all_labels, paths.output_dir / "dataset_analysis.png")
    print(f"\nsaved {out}")
    return 0


def cmd_verify_splits(args: argparse.Namespace) -> int:
    from exercise_advisor.data.splits import verify_subject_splits

    paths = _paths(args)
    leaked = False
    for ex in _exercises(args.exercise):
        labels = _load_labels(ex, paths.dataset_root)
        splits = _load_splits(ex, paths.dataset_root)
        leaks = verify_subject_splits(labels, splits)
        for split, keys in splits.items():
            subjects = {labels[k].subject_id for k in keys if k in labels}
            print(f"  {ex:<11} {split:<5} {len(keys):>5} reps  {len(subjects):>4} subjects")
        if leaks:
            leaked = True
            for (a, b), subs in leaks.items():
                print(f"  LEAK {ex}: {a} & {b} share {len(subs)} subjects")
        else:
            print(f"  {ex}: no subject leakage")
    return 1 if leaked else 0


def cmd_extract(args: argparse.Namespace) -> int:
    from exercise_advisor.pose.extract import FrameExtractor, extract_poses

    paths = _paths(args)
    extractor: FrameExtractor
    if args.backend == "mediapipe":
        from exercise_advisor.pose.mediapipe_extractor import MediaPipePoseExtractor

        extractor = MediaPipePoseExtractor(prefer_gpu=not args.cpu)
    else:
        from exercise_advisor.pose.torch_extractor import TorchPoseExtractor

        extractor = TorchPoseExtractor(device="cpu" if args.cpu else "auto")
    print(f"backend: {extractor.backend}")
    for ex in _exercises(args.exercise):
        keys = sorted(_load_labels(ex, paths.dataset_root))
        extract_poses(ex, keys, extractor, paths, overwrite=args.overwrite, max_items=args.limit)
    return 0


def cmd_train(args: argparse.Namespace) -> int:
    from exercise_advisor.training.evaluation import plot_loss_curves
    from exercise_advisor.training.trainer import train_binary

    paths = _paths(args)
    cfg = Config(
        max_epochs=args.epochs if args.epochs else Config.max_epochs,
        batch_size=args.batch_size if args.batch_size else Config.batch_size,
    )
    for ex in _exercises(args.exercise):
        labels = _load_labels(ex, paths.dataset_root)
        splits = _load_splits(ex, paths.dataset_root)
        histories = {}
        for idx, name in enumerate(error_names(ex)):
            if args.error and name != args.error:
                continue
            result = train_binary(
                ex, idx, labels, splits, paths.pose_dir(ex), cfg,
                checkpoint_dir=paths.checkpoint_dir, device=args.device,
                num_workers=args.workers,
            )  # fmt: skip
            histories[name] = result.history
            print(f"{ex}/{name}: threshold={result.threshold:.2f} -> {result.checkpoint}")
        if histories:
            plot_loss_curves(histories, ex, paths.output_dir / f"{ex}_loss_curves.png")
    return 0


def cmd_evaluate(args: argparse.Namespace) -> int:
    from exercise_advisor.data.datasets import make_dataloader
    from exercise_advisor.models.checkpoint import checkpoint_path, load_checkpoint
    from exercise_advisor.training.evaluation import evaluate_exercise
    from exercise_advisor.training.trainer import resolve_device

    paths = _paths(args)
    device = resolve_device(args.device)
    summaries = []
    for ex in _exercises(args.exercise):
        labels = _load_labels(ex, paths.dataset_root)
        splits = _load_splits(ex, paths.dataset_root)
        models: dict[str, torch.nn.Module] = {}
        thresholds: dict[str, float] = {}
        cfg = Config()
        for name in error_names(ex):
            model, meta = load_checkpoint(checkpoint_path(paths.checkpoint_dir, ex, name), device)
            models[name], thresholds[name], cfg = model, meta["threshold"], meta["config"]
        loader = make_dataloader(
            args.split, splits[args.split], labels, paths.pose_dir(ex), batch_size=64,
            num_workers=args.workers, fixed_len=cfg.fixed_len,
            use_angles=cfg.use_angles, use_velocity=cfg.use_velocity,
        )  # fmt: skip
        result = evaluate_exercise(
            models, thresholds, loader, error_names(ex), ex, args.split, device,
            plot_path=paths.output_dir / f"{ex}_{args.split}_evaluation.png",
        )  # fmt: skip
        print(result.as_markdown(), "\n")
        summaries.append(result.summary())
    out = paths.output_dir / f"metrics_{args.split}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(summaries, indent=2))
    print(f"saved {out}")
    return 0


def cmd_predict(args: argparse.Namespace) -> int:
    from exercise_advisor.inference.predictor import AQAPredictor

    paths = _paths(args)
    predictor = AQAPredictor(args.exercise, paths.checkpoint_dir, device=args.device)
    prediction = predictor.predict(args.video)
    print(json.dumps(prediction.to_dict(), indent=2) if args.json else prediction)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="exercise-advisor",
        description="Pose-based action quality assessment for barbell exercises.",
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument("-v", "--verbose", action="store_true", help="debug logging")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("analyze", help="dataset statistics and analysis figure")
    _add_common(p)
    p.set_defaults(func=cmd_analyze)

    p = sub.add_parser("verify-splits", help="check official splits for subject leakage")
    _add_common(p)
    p.set_defaults(func=cmd_verify_splits)

    p = sub.add_parser("extract", help="cache pose landmarks for every labelled rep")
    _add_common(p)
    p.add_argument("--backend", choices=["mediapipe", "torchvision"], default="mediapipe")
    p.add_argument("--cpu", action="store_true", help="disable GPU delegates")
    p.add_argument("--overwrite", action="store_true")
    p.add_argument("--limit", type=int, default=None, help="only process the first N reps")
    p.set_defaults(func=cmd_extract)

    p = sub.add_parser("train", help="train one binary TCN per error class")
    _add_common(p)
    p.add_argument("--error", default=None, help="train a single error class only")
    p.add_argument("--epochs", type=int, default=None)
    p.add_argument("--batch-size", type=int, default=None)
    p.add_argument("--device", default="auto")
    p.add_argument("--workers", type=int, default=None)
    p.set_defaults(func=cmd_train)

    p = sub.add_parser("evaluate", help="evaluate checkpoints on a split")
    _add_common(p)
    p.add_argument("--split", default="test", choices=["train", "val", "test"])
    p.add_argument("--device", default="auto")
    p.add_argument("--workers", type=int, default=None)
    p.set_defaults(func=cmd_evaluate)

    p = sub.add_parser("predict", help="score a single-rep video")
    p.add_argument("video", type=Path)
    p.add_argument("--exercise", required=True, choices=list(EXERCISE_NAMES))
    p.add_argument("--checkpoint-dir", type=Path, default=None)
    p.add_argument("--device", default="auto")
    p.add_argument("--json", action="store_true", help="print machine-readable JSON")
    p.set_defaults(func=cmd_predict)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    return int(args.func(args))


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
