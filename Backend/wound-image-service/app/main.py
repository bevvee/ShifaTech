import os
import json
import tempfile
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from .schemas import WoundRequest, WoundResponse, WoundReport
from .minio_client import download_image, upload_file, build_object_url
from .medical_diagnostic import generate_medical_diagnostic

app = FastAPI()

CONFIDENCE_MIN_ACCEPTED = float(os.getenv("WOUND_CONFIDENCE_MIN_ACCEPTED", "0.35"))
SUPPRESS_MASK_ON_LOW_CONFIDENCE = os.getenv("WOUND_SUPPRESS_MASK_ON_LOW_CONFIDENCE", "false").lower() == "true"
QUEUE_LOW_CONFIDENCE_FOR_RETRAINING = os.getenv("WOUND_QUEUE_LOW_CONFIDENCE_FOR_RETRAINING", "true").lower() == "true"


def run_analysis(image_path):
    from .inference import analyze_wound
    return analyze_wound(image_path)


def _queue_retraining_case(
    image_path,
    request,
    result,
    timestamp,
    mask_local_path=None,
    overlay_local_path=None,
):
    try:
        prefix = f"retraining-queue/{request.visit_id}/{timestamp}_{request.image_name}"

        source_ext = os.path.splitext(request.image_name)[1] or ".jpg"
        source_object = f"{prefix}_source{source_ext}"
        upload_file(source_object, image_path)

        if mask_local_path and os.path.exists(mask_local_path):
            upload_file(f"{prefix}_mask.png", mask_local_path)

        if overlay_local_path and os.path.exists(overlay_local_path):
            upload_file(f"{prefix}_overlay.png", overlay_local_path)

        confidence = result.get("confidence", {})
        metadata = {
            "visit_id": request.visit_id,
            "image_name": request.image_name,
            "timestamp": timestamp,
            "wound_pixels": result.get("wound_pixels", 0),
            "wound_percentage": result.get("wound_percentage", 0),
            "confidence": {
                "max_probability": confidence.get("max_probability", 0.0),
                "mean_probability": confidence.get("mean_probability", 0.0),
                "threshold_used": confidence.get("threshold_used", 0.0),
                "low_confidence": confidence.get("low_confidence", True),
            },
            "retraining_reason": "low_confidence_or_domain_shift",
        }

        tmp_dir = tempfile.gettempdir()
        metadata_local_path = os.path.join(tmp_dir, f"retraining_meta_{timestamp}_{request.visit_id}.json")
        with open(metadata_local_path, "w", encoding="utf-8") as fp:
            json.dump(metadata, fp)

        upload_file(f"{prefix}_metadata.json", metadata_local_path)
        return True
    except Exception as queue_error:
        print(f"Failed to queue retraining case: {str(queue_error)}")
        return False


@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze-wound", response_model=WoundResponse)
def analyze(request: WoundRequest):
    try:
        tmp_dir = tempfile.gettempdir()
        image_path = os.path.join(tmp_dir, request.image_name)

        print(f"Downloading image: {request.image_name}")
        download_image(request.image_name, image_path)
        
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found after download: {image_path}")
        
        print(f"Image downloaded to: {image_path}")

        result = run_analysis(image_path)

        artifacts = result.get("artifacts", {})
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        confidence = result.get("confidence", {})

        max_probability = float(confidence.get("max_probability", 0.0))
        explicit_low_conf = bool(confidence.get("low_confidence", False))
        is_uncertain = explicit_low_conf or (max_probability < CONFIDENCE_MIN_ACCEPTED)
        uncertainty_status = "uncertain" if is_uncertain else "accepted"

        mask_url = None
        overlay_url = None
        report_url = None
        mask_suppressed = False
        retraining_case_queued = False

        mask_local_path = artifacts.get("mask_local_path")
        overlay_local_path = artifacts.get("overlay_local_path")
        report_local_path = artifacts.get("report_local_path")

        if is_uncertain and SUPPRESS_MASK_ON_LOW_CONFIDENCE:
            mask_suppressed = True
        else:
            if mask_local_path and os.path.exists(mask_local_path):
                mask_object = f"analysis-results/{request.visit_id}/mask_{timestamp}_{request.image_name}.png"
                upload_file(mask_object, mask_local_path)
                mask_url = build_object_url(mask_object)

            if overlay_local_path and os.path.exists(overlay_local_path):
                overlay_object = f"analysis-results/{request.visit_id}/overlay_{timestamp}_{request.image_name}.png"
                upload_file(overlay_object, overlay_local_path)
                overlay_url = build_object_url(overlay_object)

        if report_local_path and os.path.exists(report_local_path):
            report_object = f"analysis-results/{request.visit_id}/report_{timestamp}_{request.image_name}.json"
            upload_file(report_object, report_local_path)
            report_url = build_object_url(report_object)

        if is_uncertain and QUEUE_LOW_CONFIDENCE_FOR_RETRAINING:
            retraining_case_queued = _queue_retraining_case(
                image_path=image_path,
                request=request,
                result=result,
                timestamp=timestamp,
                mask_local_path=mask_local_path,
                overlay_local_path=overlay_local_path,
            )

        # Generate medical diagnostic in French
        medical_diagnostic = generate_medical_diagnostic(
            wound_pixels=result["wound_pixels"],
            wound_percentage=result["wound_percentage"],
            max_probability=max_probability,
            low_confidence=explicit_low_conf,
        )

        report_data = result.get("report") or {}
        wound_report = WoundReport(
            date_analyse=medical_diagnostic.date_analyse,
            plaie_pourcentage=result["wound_percentage"],
            plaie_pixels=result["wound_pixels"],
            seuil_utilise=float(confidence.get("threshold_used", 0.0)),
            niveau_confiance_detection=medical_diagnostic.niveau_confiance,
            severite_estimee=medical_diagnostic.severite,
            resumé=report_data.get("summary", "Rapport d'analyse de plaie généré automatiquement."),
            resultats_cles=report_data.get("key_findings", []),
            diagnostic_preliminaire=medical_diagnostic,
        )

        return {
            "visit_id": request.visit_id,
            "result": {
                "wound_pixels": result["wound_pixels"],
                "wound_percentage": result["wound_percentage"],
                "confidence": confidence,
                "diagnostic": medical_diagnostic,
                "uncertainty_status": uncertainty_status,
                "mask_suppressed": mask_suppressed,
                "retraining_case_queued": retraining_case_queued,
                "mask_url": mask_url,
                "overlay_url": overlay_url,
                "report_url": report_url,
                "report": wound_report,
            }
        }
        
    except Exception as e:
        print(f"Error in analyze endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing wound: {str(e)}")
