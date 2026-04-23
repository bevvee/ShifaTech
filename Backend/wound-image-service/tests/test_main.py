import tempfile
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_returns_enriched_result():
    with patch("app.main.download_image") as mock_download, patch("app.main.run_analysis") as mock_analysis, patch("app.main.upload_file") as mock_upload, patch("app.main.build_object_url") as mock_url:
        tmp_dir = tempfile.gettempdir()
        image_path = Path(tmp_dir) / "IMG1001.jpg"
        image_path.write_bytes(b"fake-image")

        mask_path = Path(tmp_dir) / "mask_test.png"
        overlay_path = Path(tmp_dir) / "overlay_test.png"
        report_path = Path(tmp_dir) / "report_test.json"
        mask_path.write_bytes(b"mask")
        overlay_path.write_bytes(b"overlay")
        report_path.write_text("{}", encoding="utf-8")

        def fake_download(_object_name, file_path):
            Path(file_path).write_bytes(b"fake-image")

        mock_download.side_effect = fake_download
        mock_analysis.return_value = {
            "wound_pixels": 165,
            "wound_percentage": 0.03,
            "confidence": {
                "max_probability": 0.91,
                "mean_probability": 0.12,
                "threshold_used": 0.5,
                "low_confidence": False,
            },
            "report": {
                "title": "Wound Segmentation Report",
                "wound_pixels": 165,
                "wound_percentage": 0.03,
                "threshold_used": 0.5,
                "confidence_level": "high",
                "severity": "minimal",
                "summary": "The segmentation model detected approximately 0.03% wound area (165 pixels) with high confidence.",
                "key_findings": [
                    "Estimated wound area: 0.03% of the image.",
                    "Detected wound pixels: 165.",
                    "Confidence status: high.",
                    "Suggested severity: minimal.",
                ],
                "recommendation": "Minimal wound area detected; continue current care and monitor for changes.",
                "disclaimer": "This report is an automated decision-support summary and does not replace clinical judgment.",
            },
            "artifacts": {
                "mask_local_path": str(mask_path),
                "overlay_local_path": str(overlay_path),
                "report_local_path": str(report_path),
            },
        }
        mock_url.side_effect = lambda obj: f"http://localhost:9000/wound-images/{obj}"

        with patch("app.main.SUPPRESS_MASK_ON_LOW_CONFIDENCE", False), patch("app.main.QUEUE_LOW_CONFIDENCE_FOR_RETRAINING", False):
            response = client.post(
                "/analyze-wound",
                json={"image_name": "IMG1001.jpg", "visit_id": 1},
            )

        assert response.status_code == 200
        body = response.json()
        assert body["visit_id"] == 1
        assert body["result"]["wound_pixels"] == 165
        assert body["result"]["wound_percentage"] == 0.03
        assert body["result"]["confidence"]["threshold_used"] == 0.5
        assert body["result"]["uncertainty_status"] == "accepted"
        assert body["result"]["mask_suppressed"] is False
        assert body["result"]["retraining_case_queued"] is False
        assert body["result"]["mask_url"] is not None
        assert body["result"]["overlay_url"] is not None
        assert body["result"]["report_url"] is not None
        assert body["result"]["report"]["severity"] == "minimal"
        assert mock_upload.call_count == 3


def test_analyze_suppresses_uncertain_mask_and_queues_retraining_case():
    with patch("app.main.download_image") as mock_download, patch("app.main.run_analysis") as mock_analysis, patch("app.main.upload_file") as mock_upload, patch("app.main.build_object_url") as mock_url:
        tmp_dir = tempfile.gettempdir()
        image_path = Path(tmp_dir) / "IMG1002.jpg"
        image_path.write_bytes(b"fake-image")

        mask_path = Path(tmp_dir) / "mask_test_uncertain.png"
        overlay_path = Path(tmp_dir) / "overlay_test_uncertain.png"
        report_path = Path(tmp_dir) / "report_test_uncertain.json"
        mask_path.write_bytes(b"mask")
        overlay_path.write_bytes(b"overlay")
        report_path.write_text("{}", encoding="utf-8")

        def fake_download(_object_name, file_path):
            Path(file_path).write_bytes(b"fake-image")

        mock_download.side_effect = fake_download
        mock_analysis.return_value = {
            "wound_pixels": 20,
            "wound_percentage": 0.01,
            "confidence": {
                "max_probability": 0.2,
                "mean_probability": 0.08,
                "threshold_used": 0.2,
                "low_confidence": True,
            },
            "report": {
                "title": "Wound Segmentation Report",
                "wound_pixels": 20,
                "wound_percentage": 0.01,
                "threshold_used": 0.2,
                "confidence_level": "low",
                "severity": "minimal",
                "summary": "The segmentation model detected approximately 0.01% wound area (20 pixels) with low confidence.",
                "key_findings": [
                    "Estimated wound area: 0.01% of the image.",
                    "Detected wound pixels: 20.",
                    "Confidence status: low.",
                    "Suggested severity: minimal.",
                ],
                "recommendation": "Minimal wound area detected; continue current care and monitor for changes. Interpretation confidence is limited, so a clinician should review the image before acting.",
                "disclaimer": "This report is an automated decision-support summary and does not replace clinical judgment.",
            },
            "artifacts": {
                "mask_local_path": str(mask_path),
                "overlay_local_path": str(overlay_path),
                "report_local_path": str(report_path),
            },
        }
        mock_url.side_effect = lambda obj: f"http://localhost:9000/wound-images/{obj}"

        with patch("app.main.SUPPRESS_MASK_ON_LOW_CONFIDENCE", True), patch("app.main.QUEUE_LOW_CONFIDENCE_FOR_RETRAINING", True):
            response = client.post(
                "/analyze-wound",
                json={"image_name": "IMG1002.jpg", "visit_id": 2},
            )

        assert response.status_code == 200
        body = response.json()
        assert body["result"]["uncertainty_status"] == "uncertain"
        assert body["result"]["mask_suppressed"] is True
        assert body["result"]["retraining_case_queued"] is True
        assert body["result"]["mask_url"] is None
        assert body["result"]["overlay_url"] is None
        assert mock_upload.call_count >= 2


def test_analyze_returns_500_on_missing_image():
    with patch("app.main.download_image") as mock_download:
        def fake_download(_object_name, _file_path):
            return None

        mock_download.side_effect = fake_download

        response = client.post(
            "/analyze-wound",
            json={"image_name": "missing.jpg", "visit_id": 2},
        )

        assert response.status_code == 500
        assert "Error analyzing wound" in response.json()["detail"]


def test_analyze_returns_500_on_corrupt_image():
    with patch("app.main.download_image") as mock_download, patch("app.main.run_analysis") as mock_analysis:
        def fake_download(_object_name, file_path):
            Path(file_path).write_bytes(b"corrupt")

        mock_download.side_effect = fake_download
        mock_analysis.side_effect = ValueError("Failed to load image from /tmp/corrupt.jpg")

        response = client.post(
            "/analyze-wound",
            json={"image_name": "corrupt.jpg", "visit_id": 3},
        )

        assert response.status_code == 500
        assert "Failed to load image" in response.json()["detail"]