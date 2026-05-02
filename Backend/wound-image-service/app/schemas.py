from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UploadImageResponse(BaseModel):
    object_name: str
    object_url: str

class WoundRequest(BaseModel):
    image_name: str
    visit_id: int


class ConfidenceInfo(BaseModel):
    max_probability: float
    mean_probability: float
    threshold_used: float
    low_confidence: bool


class MedicalDiagnostic(BaseModel):
    """Diagnostic médical détaillé et utile pour le personnel médical"""
    titre: str = "Analyse de Plaie - Rapport Diagnostic"
    date_analyse: datetime
    
    # Informations cliniques
    pourcentage_plaie: float
    pixels_plaie: int
    severite: str  # minimal, limité, modéré, étendu
    niveau_confiance: str  # faible, moyen, élevé
    
    # Interprétation clinique
    interpretations: list[str]
    actions_recommandees: list[str]
    contre_indications: list[str]
    
    # Suivi
    necessites_reevaluation: bool
    delai_reevaluation: Optional[str] = None
    
    # Métadonnées
    version_modele: str = "SimpleUNetV1"
    note_medical: str = "Ce rapport est un outil d'aide à la décision automatisé et ne remplace pas le jugement clinique."


class WoundReport(BaseModel):
    """Rapport détaillé pour archive"""
    titre: str = "Rapport d'Analyse de Plaie"
    date_analyse: datetime
    plaie_pourcentage: float
    plaie_pixels: int
    seuil_utilise: float
    niveau_confiance_detection: str
    severite_estimee: str
    
    resumé: str
    resultats_cles: list[str]
    diagnostic_preliminaire: MedicalDiagnostic
    
    avertissement: str = (
        "Ce rapport est un résumé de soutien à la décision automatisé et ne remplace pas le jugement clinique. "
        "Seul un professionnel de santé qualifié peut établir un diagnostic définitif."
    )


class WoundResult(BaseModel):
    wound_pixels: int
    wound_percentage: float
    confidence: ConfidenceInfo
    report: Optional[WoundReport] = None
    diagnostic: Optional[MedicalDiagnostic] = None
    uncertainty_status: str = "accepted"
    mask_suppressed: bool = False
    retraining_case_queued: bool = False
    mask_url: Optional[str] = None
    overlay_url: Optional[str] = None
    report_url: Optional[str] = None


class WoundResponse(BaseModel):
    visit_id: int
    result: WoundResult