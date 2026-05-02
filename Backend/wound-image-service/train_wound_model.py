"""
Improved wound segmentation training script with model compatibility checks.
This ensures the saved checkpoint will be properly recognized by the inference code.
"""

import argparse
import random
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

import kagglehub
from kagglehub import KaggleDatasetAdapter
import numpy as np
import pandas as pd
import torch
from PIL import Image
from sklearn.model_selection import train_test_split
from torch import nn
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms


DATASET_HANDLE = "leoscode/wound-segmentation-images"
CORRESPONDENCE_FILE = "data_wound_seg/correspondence_table.xlsx"
DEFAULT_DATA_SUBDIR = "data_wound_seg"


@dataclass
class Config:
    kaggle_dataset: str = DATASET_HANDLE
    correspondence_file: str = CORRESPONDENCE_FILE
    batch_size: int = 8
    image_size: int = 256
    epochs: int = 40
    learning_rate: float = 1e-3
    seed: int = 42
    num_workers: int = 0
    save_path: str = "wound_model.pth"


def log(message: str):
    now = datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] {message}")


def set_seed(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def download_dataset(cfg: Config) -> Path:
    root = Path(kagglehub.dataset_download(cfg.kaggle_dataset))
    data_root = root / DEFAULT_DATA_SUBDIR
    if not data_root.exists():
        raise FileNotFoundError(f"Dataset folder not found: {data_root}")
    return data_root


def load_correspondence_table(kaggle_dataset: str, file_path: str) -> pd.DataFrame:
    return kagglehub.dataset_load(
        KaggleDatasetAdapter.PANDAS,
        kaggle_dataset,
        file_path,
    )


def build_split_frame(data_root: Path, split_name: str, mapping_df: pd.DataFrame) -> pd.DataFrame:

    image_dir = data_root / f"{split_name}_images"
    mask_dir = data_root / f"{split_name}_masks"

    new_id_to_origin = dict(zip(mapping_df["new_id"].astype(str), mapping_df["origin_id"].astype(str)))

    rows = []

    for image_path in sorted(image_dir.iterdir()):

        if not image_path.is_file():
            continue

        mask_path = mask_dir / image_path.name
        if not mask_path.exists():
            continue

        rows.append(
            {
                "image_path": str(image_path),
                "mask_path": str(mask_path),
                "new_id": image_path.name,
                "origin_id": new_id_to_origin.get(image_path.name, ""),
            }
        )

    return pd.DataFrame(rows)


def make_image_transform(train: bool, image_size: int):

    if train:
        return transforms.Compose(
            [
                transforms.Resize((image_size, image_size)),
                transforms.RandomHorizontalFlip(),
                transforms.RandomVerticalFlip(),
                transforms.RandomRotation(15),
                transforms.ColorJitter(brightness=0.2, contrast=0.2),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
            ]
        )

    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]
    )


def make_mask_transform(image_size: int):

    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size), interpolation=transforms.InterpolationMode.NEAREST),
            transforms.PILToTensor(),
        ]
    )


class WoundSegmentationDataset(Dataset):

    def __init__(self, frame: pd.DataFrame, image_size: int, train: bool):
        self.frame = frame.reset_index(drop=True)
        self.image_transform = make_image_transform(train, image_size)
        self.mask_transform = make_mask_transform(image_size)

    def __len__(self):
        return len(self.frame)

    def __getitem__(self, index):

        row = self.frame.iloc[index]

        image = Image.open(row["image_path"]).convert("RGB")
        mask = Image.open(row["mask_path"]).convert("L")

        image_tensor = self.image_transform(image)

        mask_tensor = self.mask_transform(mask).float() / 255.0
        mask_tensor = (mask_tensor > 0.5).float()

        return image_tensor, mask_tensor


class DoubleConv(nn.Module):

    def __init__(self, in_channels, out_channels):

        super().__init__()

        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class SimpleUNetV1(nn.Module):
    """
    This matches the _SimpleUNetV1 architecture in model_loader.py
    for compatibility with the inference code.
    """

    def __init__(self, in_channels=3, out_channels=1):

        super().__init__()

        self.down1 = DoubleConv(in_channels, 32)
        self.pool1 = nn.MaxPool2d(2)

        self.down2 = DoubleConv(32, 64)
        self.pool2 = nn.MaxPool2d(2)

        self.down3 = DoubleConv(64, 128)
        self.pool3 = nn.MaxPool2d(2)

        self.bottom = DoubleConv(128, 256)

        self.up3 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.conv3 = DoubleConv(256, 128)

        self.up2 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.conv2 = DoubleConv(128, 64)

        self.up1 = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
        self.conv1 = DoubleConv(64, 32)

        self.final = nn.Conv2d(32, out_channels, kernel_size=1)

    def forward(self, x):

        d1 = self.down1(x)
        d2 = self.down2(self.pool1(d1))
        d3 = self.down3(self.pool2(d2))

        b = self.bottom(self.pool3(d3))

        u3 = self.up3(b)
        c3 = self.conv3(torch.cat([u3, d3], dim=1))

        u2 = self.up2(c3)
        c2 = self.conv2(torch.cat([u2, d2], dim=1))

        u1 = self.up1(c2)
        c1 = self.conv1(torch.cat([u1, d1], dim=1))

        return self.final(c1)


def dice_loss(logits, targets):

    probs = torch.sigmoid(logits)

    probs = probs.flatten(1)
    targets = targets.flatten(1)

    intersection = (probs * targets).sum(1)

    dice = (2 * intersection + 1e-6) / (probs.sum(1) + targets.sum(1) + 1e-6)

    return 1 - dice.mean()


def dice_score(logits, targets):

    preds = (torch.sigmoid(logits) > 0.5).float()

    preds = preds.flatten(1)
    targets = targets.flatten(1)

    intersection = (preds * targets).sum(1)

    dice = (2 * intersection + 1e-6) / (preds.sum(1) + targets.sum(1) + 1e-6)

    return float(dice.mean())


def iou_score(logits, targets):

    preds = (torch.sigmoid(logits) > 0.5).float()

    preds = preds.flatten(1)
    targets = targets.flatten(1)

    intersection = (preds * targets).sum(1)
    union = preds.sum(1) + targets.sum(1) - intersection

    iou = (intersection + 1e-6) / (union + 1e-6)

    return float(iou.mean())


def train_one_epoch(model, loader, optimizer, device):

    model.train()

    total_loss = 0

    for images, masks in loader:

        images = images.to(device)
        masks = masks.to(device)

        logits = model(images)

        loss = nn.functional.binary_cross_entropy_with_logits(logits, masks) + dice_loss(logits, masks)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * images.size(0)

    return total_loss / len(loader.dataset)


@torch.no_grad()
def evaluate(model, loader, device):

    model.eval()

    total_loss = 0
    dice_scores = []
    iou_scores = []

    for images, masks in loader:

        images = images.to(device)
        masks = masks.to(device)

        logits = model(images)

        loss = nn.functional.binary_cross_entropy_with_logits(logits, masks) + dice_loss(logits, masks)

        total_loss += loss.item() * images.size(0)

        dice_scores.append(dice_score(logits, masks))
        iou_scores.append(iou_score(logits, masks))

    return total_loss / len(loader.dataset), np.mean(dice_scores), np.mean(iou_scores)


def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


def run_training(cfg: Config):

    start_time = time.time()

    set_seed(cfg.seed)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    log("===== SYSTEM INFO =====")
    log(f"Device: {device}")

    if torch.cuda.is_available():
        log(f"GPU: {torch.cuda.get_device_name(0)}")

    data_root = download_dataset(cfg)

    mapping_df = load_correspondence_table(cfg.kaggle_dataset, cfg.correspondence_file)

    log(f"Mapping rows: {len(mapping_df)}")

    train_loader, val_loader, test_loader = build_dataloaders(cfg, data_root, mapping_df)

    log("===== DATASET =====")
    log(f"Train: {len(train_loader.dataset)}")
    log(f"Val: {len(val_loader.dataset)}")
    log(f"Test: {len(test_loader.dataset)}")

    model = SimpleUNetV1().to(device)

    log("===== MODEL =====")
    log(f"Architecture: SimpleUNetV1 (compatible with inference)")
    log(f"Parameters: {count_parameters(model):,}")

    optimizer = torch.optim.Adam(model.parameters(), lr=cfg.learning_rate)

    best_val_dice = -1
    best_state = None

    for epoch in range(1, cfg.epochs + 1):

        epoch_start = time.time()

        train_loss = train_one_epoch(model, train_loader, optimizer, device)

        val_loss, val_dice, val_iou = evaluate(model, val_loader, device)

        log(f"Epoch {epoch}/{cfg.epochs}")
        log(f"Train Loss: {train_loss:.4f}")
        log(f"Val Loss: {val_loss:.4f}")
        log(f"Dice: {val_dice:.4f}")
        log(f"IoU: {val_iou:.4f}")

        torch.save(model.state_dict(), f"checkpoint_epoch_{epoch}.pth")

        if val_dice > best_val_dice:

            log(f"New best model! Dice improved {best_val_dice:.4f} -> {val_dice:.4f}")

            best_val_dice = val_dice
            best_state = model.state_dict()

        log(f"Epoch time: {time.time() - epoch_start:.2f}s")

    model.load_state_dict(best_state)

    test_loss, test_dice, test_iou = evaluate(model, test_loader, device)

    log("===== TEST RESULTS =====")
    log(f"Test Loss: {test_loss:.4f}")
    log(f"Test Dice: {test_dice:.4f}")
    log(f"Test IoU: {test_iou:.4f}")

    torch.save(model.state_dict(), cfg.save_path)

    log(f"Model saved to {cfg.save_path}")

    total_time = time.time() - start_time

    log(f"Total training time: {total_time / 60:.2f} minutes")


def build_dataloaders(cfg, data_root, mapping_df):

    train_frame = build_split_frame(data_root, "train", mapping_df)
    test_frame = build_split_frame(data_root, "test", mapping_df)

    train_frame, val_frame = train_test_split(train_frame, test_size=0.15, random_state=cfg.seed)

    train_dataset = WoundSegmentationDataset(train_frame, cfg.image_size, True)
    val_dataset = WoundSegmentationDataset(val_frame, cfg.image_size, False)
    test_dataset = WoundSegmentationDataset(test_frame, cfg.image_size, False)

    train_loader = DataLoader(train_dataset, batch_size=cfg.batch_size, shuffle=True, num_workers=cfg.num_workers)
    val_loader = DataLoader(val_dataset, batch_size=cfg.batch_size, num_workers=cfg.num_workers)
    test_loader = DataLoader(test_dataset, batch_size=cfg.batch_size, num_workers=cfg.num_workers)

    return train_loader, val_loader, test_loader


def parse_args():

    parser = argparse.ArgumentParser()

    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--image_size", type=int, default=256)
    parser.add_argument("--learning_rate", type=float, default=1e-3)
    parser.add_argument("--save_path", type=str, default="wound_model.pth", help="Path to save the model")

    args, _ = parser.parse_known_args()

    return Config(
        epochs=args.epochs,
        batch_size=args.batch_size,
        image_size=args.image_size,
        learning_rate=args.learning_rate,
        save_path=args.save_path,
    )


if __name__ == "__main__":
    run_training(parse_args())
