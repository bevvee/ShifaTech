import torch
import segmentation_models_pytorch as smp
import os
import torch.nn as nn

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_FILE = os.getenv("WOUND_MODEL_FILE", "wound_model-V1.pth")


class _DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class _SimpleUNetV1(nn.Module):
    def __init__(self):
        super().__init__()
        self.down1 = _DoubleConv(3, 32)
        self.pool1 = nn.MaxPool2d(2)
        self.down2 = _DoubleConv(32, 64)
        self.pool2 = nn.MaxPool2d(2)
        self.down3 = _DoubleConv(64, 128)
        self.pool3 = nn.MaxPool2d(2)
        self.bottom = _DoubleConv(128, 256)

        self.up3 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.conv3 = _DoubleConv(256, 128)

        self.up2 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.conv2 = _DoubleConv(128, 64)

        self.up1 = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
        self.conv1 = _DoubleConv(64, 32)

        self.final = nn.Conv2d(32, 1, kernel_size=1)

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


def _extract_state_dict(checkpoint):
    if isinstance(checkpoint, dict):
        if "model" in checkpoint and isinstance(checkpoint["model"], dict):
            state_dict = checkpoint["model"]
        elif "state_dict" in checkpoint and isinstance(checkpoint["state_dict"], dict):
            state_dict = checkpoint["state_dict"]
        else:
            state_dict = checkpoint
    else:
        state_dict = checkpoint

    if not isinstance(state_dict, dict):
        raise ValueError("Checkpoint does not contain a valid state_dict")

    normalized = {}
    for key, value in state_dict.items():
        new_key = key
        if new_key.startswith("module."):
            new_key = new_key[len("module."):]
        if new_key.startswith("model."):
            new_key = new_key[len("model."):]
        normalized[new_key] = value

    return normalized


def _infer_architecture(state_dict):
    keys = list(state_dict.keys())
    if any(key.startswith("down1.") for key in keys) and any(key.startswith("up1.") for key in keys):
        return "simple_unet_v1"
    if any(key.startswith("encoder.") for key in keys):
        return "smp_unet_resnet34"
    return "unknown"


def _build_model(architecture):
    if architecture == "simple_unet_v1":
        return _SimpleUNetV1()
    if architecture == "smp_unet_resnet34":
        return smp.Unet(
            encoder_name="resnet34",
            encoder_weights=None,
            in_channels=3,
            classes=1,
        )
    raise ValueError(f"Unsupported checkpoint architecture: {architecture}")


def _load_into_model(model, state_dict):
    load_result = model.load_state_dict(state_dict, strict=False)
    matched_keys = len(state_dict) - len(load_result.unexpected_keys)
    coverage = matched_keys / max(1, len(state_dict))
    return load_result, coverage

def load_model():
    try:
        candidate_files = [MODEL_FILE]
        for fallback_name in ["wound_segmentation_unet.pth", "wound_model-V1.pth", "wound_model-V0.pth"]:
            if fallback_name not in candidate_files:
                candidate_files.append(fallback_name)

        last_error = None
        for model_file in candidate_files:
            model_path = os.path.join(BASE_DIR, "models", model_file)
            print(f"Loading model from: {model_path}")

            if not os.path.exists(model_path):
                print(f"Model file not found, skipping: {model_path}")
                continue

            checkpoint = torch.load(model_path, map_location="cpu")
            state_dict = _extract_state_dict(checkpoint)
            architecture = _infer_architecture(state_dict)
            model = _build_model(architecture)
            load_result, coverage = _load_into_model(model, state_dict)

            if coverage < 0.9:
                last_error = RuntimeError(
                    "Checkpoint mismatch: "
                    f"missing={len(load_result.missing_keys)}, "
                    f"unexpected={len(load_result.unexpected_keys)}, "
                    f"coverage={coverage:.2f}, file={model_file}, arch={architecture}"
                )
                print(str(last_error))
                continue

            model.eval()
            model.cpu()
            print(f"Model loaded successfully from {model_file} (arch={architecture}, coverage={coverage:.2f})")
            return model

        if last_error is not None:
            raise last_error
        raise FileNotFoundError("No compatible wound model checkpoint found")
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        raise

model = load_model()