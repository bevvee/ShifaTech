import torch
import segmentation_models_pytorch as smp

MODEL_PATH = "models/wound_model.pth"

def load_model():

    model = smp.Unet(
        encoder_name="resnet34",
        encoder_weights="imagenet",
        in_channels=3,
        classes=1
    )

    state_dict = torch.load(MODEL_PATH, map_location="cpu")

    model.load_state_dict(state_dict)

    model.eval()

    return model

model = load_model()