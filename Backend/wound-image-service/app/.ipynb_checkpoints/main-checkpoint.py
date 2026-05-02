import os
import tempfile
from fastapi import FastAPI
from .schemas import WoundRequest
from .minio_client import download_image
from .inference import analyze_wound

app = FastAPI()

@app.post("/analyze-wound")
def analyze(request: WoundRequest):

    tmp_dir = tempfile.gettempdir()
    image_path = os.path.join(tmp_dir, request.image_name)

    download_image(request.image_name,image_path)

    result = analyze_wound(image_path)

    return {
        "visit_id": request.visit_id,
        "result": result
    }