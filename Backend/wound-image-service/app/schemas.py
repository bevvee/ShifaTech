from pydantic import BaseModel
from typing import Optional

class WoundRequest(BaseModel):
    image_name: str
    visit_id: int


class ConfidenceInfo(BaseModel):
    max_probability: float
    mean_probability: float
    threshold_used: float
    low_confidence: bool


class WoundReport(BaseModel):
    title: str = "Wound Segmentation Report"
    wound_pixels: int
    wound_percentage: float
    threshold_used: float
    confidence_level: str
    severity: str
    summary: str
    key_findings: list[str]
    recommendation: str
    disclaimer: str = (
        "This report is an automated decision-support summary and does not replace clinical judgment."
    )


class WoundResult(BaseModel):
    wound_pixels: int
    wound_percentage: float
    confidence: ConfidenceInfo
    report: Optional[WoundReport] = None
    uncertainty_status: str = "accepted"
    mask_suppressed: bool = False
    retraining_case_queued: bool = False
    mask_url: Optional[str] = None
    overlay_url: Optional[str] = None
    report_url: Optional[str] = None


class WoundResponse(BaseModel):
    visit_id: int
    result: WoundResult