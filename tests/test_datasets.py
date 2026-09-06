import torch

from exercise_advisor.data.datasets import (
    BinaryPoseDataset,
    PoseDataset,
    make_binary_dataloader,
    make_dataloader,
)
from exercise_advisor.data.labels import load_exercise_labels, load_splits


def test_pose_dataset_item_shapes(synthetic_dataset):
    labels = load_exercise_labels("OHP", synthetic_dataset.dataset_root)
    splits = load_splits("OHP", synthetic_dataset.dataset_root)
    ds = PoseDataset(splits["train"], labels, synthetic_dataset.pose_dir("OHP"), fixed_len=50)
    assert len(ds) == len(splits["train"])
    item = ds[0]
    assert item["X"].shape == (50, 222)
    assert item["X"].dtype == torch.float32
    assert item["y_errors"].shape == (2,)
    assert item["rep_key"] in labels


def test_pose_dataset_skips_missing_pose_files(synthetic_dataset):
    labels = load_exercise_labels("OHP", synthetic_dataset.dataset_root)
    ds = PoseDataset(["does_not_exist"], labels, synthetic_dataset.pose_dir("OHP"))
    assert len(ds) == 0


def test_binary_dataset_balances_training_split(synthetic_dataset):
    labels = load_exercise_labels("Squat", synthetic_dataset.dataset_root)
    splits = load_splits("Squat", synthetic_dataset.dataset_root)
    ds = BinaryPoseDataset(
        splits["train"], labels, synthetic_dataset.pose_dir("Squat"),
        target_class_idx=0, balance=True, augment=True,
    )  # fmt: skip
    ys = [labels[k].multihot[0] for k in ds.keys]
    assert sum(ys) == len(ys) - sum(ys)
    item = ds[0]
    assert item["y_binary"].shape == ()
    assert item["y_binary"].item() in (0.0, 1.0)


def test_binary_dataset_val_untouched(synthetic_dataset):
    labels = load_exercise_labels("Squat", synthetic_dataset.dataset_root)
    splits = load_splits("Squat", synthetic_dataset.dataset_root)
    ds = BinaryPoseDataset(
        splits["val"], labels, synthetic_dataset.pose_dir("Squat"), target_class_idx=1
    )
    assert ds.keys == splits["val"]


def test_dataloaders_batch(synthetic_dataset):
    labels = load_exercise_labels("BarbellRow", synthetic_dataset.dataset_root)
    splits = load_splits("BarbellRow", synthetic_dataset.dataset_root)
    pose_dir = synthetic_dataset.pose_dir("BarbellRow")
    loader = make_dataloader("test", splits["test"], labels, pose_dir, batch_size=4, num_workers=0)
    batch = next(iter(loader))
    assert batch["X"].shape == (4, 100, 222)
    assert batch["y_errors"].shape == (4, 2)

    bloader = make_binary_dataloader(
        "train", splits["train"], labels, pose_dir, target_class_idx=1, batch_size=4, num_workers=0
    )
    batch = next(iter(bloader))
    assert batch["X"].shape == (4, 100, 222)
    assert batch["y_binary"].shape == (4,)
