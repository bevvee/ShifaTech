import cv2
import numpy as np
import torch
from .model_loader import model

def analyze_wound(image_path):

    img = cv2.imread(image_path)
    img = cv2.resize(img,(256,256))

    img = img/255.0
    img = np.transpose(img,(2,0,1))

    tensor = torch.tensor(img).unsqueeze(0).float()

    with torch.no_grad():
        output = model(tensor)

    mask = output.argmax(1).squeeze().numpy()

    wound_pixels = int((mask == 2).sum())

    return {
        "wound_pixels": wound_pixels
    }