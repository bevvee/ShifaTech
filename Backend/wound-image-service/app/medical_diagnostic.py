"""
Module de diagnostic médical en français.
Génère des rapports cliniques utiles basés sur les résultats de segmentation.
"""

from datetime import datetime
from typing import Dict, List
from .schemas import MedicalDiagnostic


# Classification de sévérité
SEVERITY_THRESHOLDS = {
    "minimal": (0, 1),
    "limité": (1, 5),
    "modéré": (5, 12),
    "étendu": (12, 100),
}

# Seuils de confiance
CONFIDENCE_THRESHOLDS = {
    "faible": (0, 0.5),
    "moyen": (0.5, 0.7),
    "élevé": (0.7, 1.0),
}


def classify_severity_fr(wound_percentage: float) -> str:
    """Classifie la sévérité de la plaie en français"""
    for severity, (min_pct, max_pct) in SEVERITY_THRESHOLDS.items():
        if min_pct <= wound_percentage < max_pct:
            return severity
    return "étendu"


def classify_confidence_fr(max_probability: float, low_confidence: bool) -> str:
    """Classifie le niveau de confiance en français"""
    if low_confidence:
        return "faible"
    if max_probability >= 0.7:
        return "élevé"
    if max_probability >= 0.5:
        return "moyen"
    return "faible"


def get_severity_label(severity: str) -> str:
    """Retourne le label français complet pour une sévérité"""
    labels = {
        "minimal": "Plaie minimale",
        "limité": "Plaie limitée",
        "modéré": "Plaie modérée",
        "étendu": "Plaie extensive",
    }
    return labels.get(severity, severity)


def generate_clinical_interpretations(
    severity: str,
    wound_percentage: float,
    confidence_level: str,
) -> List[str]:
    """Génère des interprétations cliniques en français"""
    interpretations = []

    # Interprétation basée sur la sévérité
    if severity == "minimal":
        interpretations.append(f"Plaie très légère détectée ({wound_percentage:.2f}% de la surface)")
        interpretations.append("La zone touchée est négligeable")
        interpretations.append("Peu de risque de complications majeures")

    elif severity == "limité":
        interpretations.append(f"Plaie légère à modérée détectée ({wound_percentage:.2f}% de la surface)")
        interpretations.append("Zone affectée circonscrite")
        interpretations.append("Suivi régulier recommandé")

    elif severity == "modéré":
        interpretations.append(f"Plaie importante détectée ({wound_percentage:.2f}% de la surface)")
        interpretations.append("Zone affectée significative")
        interpretations.append("Intervention médicale adaptée nécessaire")

    elif severity == "étendu":
        interpretations.append(f"Plaie très importante détectée ({wound_percentage:.2f}% de la surface)")
        interpretations.append("Zone affectée majeure")
        interpretations.append("Intervention médicale urgente recommandée")

    # Commentaire sur la confiance
    if confidence_level == "faible":
        interpretations.append("⚠️ ATTENTION: Faible niveau de confiance du modèle - relecture clinique impérative")

    elif confidence_level == "moyen":
        interpretations.append("Niveau de confiance modéré - vérification clinique conseillée")

    return interpretations


def generate_medical_recommendations(
    severity: str,
    confidence_level: str,
    wound_percentage: float,
) -> List[str]:
    """Génère des recommandations médicales basées sur le diagnostic"""
    recommendations = []

    if severity == "minimal":
        recommendations.append("Poursuivre les soins actuels")
        recommendations.append("Surveillance hebdomadaire recommandée")
        recommendations.append("Maintenir l'hygiène et la propreté de la plaie")
        recommendations.append("Consulter si aggravation ou signes d'infection")

    elif severity == "limité":
        recommendations.append("Suivi tous les 3-4 jours recommandé")
        recommendations.append("Assurer un nettoyage quotidien de la plaie")
        recommendations.append("Appliquer un pansement approprié")
        recommendations.append("Évaluer la nécessité d'un traitement spécialisé")

    elif severity == "modéré":
        recommendations.append("Évaluation médicale dans les 24-48 heures")
        recommendations.append("Consultation spécialisée envisagée")
        recommendations.append("Suivi tous les 2-3 jours minimum")
        recommendations.append("Envisager un traitement antimicrobien si approprié")
        recommendations.append("Documenter les signes vitaux et symptômes associés")

    elif severity == "étendu":
        recommendations.append("⚠️ URGENT: Évaluation médicale immédiate requise")
        recommendations.append("Consultation spécialisée prioritaire")
        recommendations.append("Suivi quotidien recommandé")
        recommendations.append("Traitement intensive probablement nécessaire")
        recommendations.append("Évaluer les risques d'infection et de complications")

    # Recommandations spécifiques sur la confiance
    if confidence_level == "faible":
        recommendations.insert(
            0,
            "🔍 Demander l'avis d'un professionnel de santé avant toute action basée sur ce diagnostic"
        )

    return recommendations


def generate_contraindications(severity: str) -> List[str]:
    """Retourne les contre-indications et précautions"""
    contraindications = []

    if severity in ["étendu", "modéré"]:
        contraindications.append("Ne pas retarder la consultation médicale")
        contraindications.append("Éviter l'automédication non supervisée")

    if severity == "étendu":
        contraindications.extend([
            "Ne pas minimiser l'importance de la plaie",
            "Consultation immédiate impérative",
            "Transport sécurisé vers une structure de soins adaptée recommandé"
        ])

    contraindications.extend([
        "Ne pas dépendre uniquement de ce diagnostic automatisé",
        "La décision clinique finale revient au professionnel de santé"
    ])

    return contraindications


def get_reevaluation_delay(severity: str) -> tuple[bool, str]:
    """Retourne si une réévaluation est nécessaire et après quel délai"""
    delays = {
        "minimal": (False, None),
        "limité": (True, "7 jours"),
        "modéré": (True, "3-4 jours"),
        "étendu": (True, "24 heures (urgent)"),
    }
    return delays.get(severity, (True, "À définir par le clinicien"))


def generate_medical_diagnostic(
    wound_pixels: int,
    wound_percentage: float,
    max_probability: float,
    low_confidence: bool,
) -> MedicalDiagnostic:
    """Génère un diagnostic médical complet et utile"""

    severity = classify_severity_fr(wound_percentage)
    confidence_level = classify_confidence_fr(max_probability, low_confidence)

    interpretations = generate_clinical_interpretations(
        severity,
        wound_percentage,
        confidence_level
    )

    recommendations = generate_medical_recommendations(
        severity,
        confidence_level,
        wound_percentage
    )

    contraindications = generate_contraindications(severity)

    needs_reevaluation, reevaluation_delay = get_reevaluation_delay(severity)

    diagnostic = MedicalDiagnostic(
        titre="Analyse de Plaie - Rapport Diagnostic",
        date_analyse=datetime.utcnow(),
        pourcentage_plaie=wound_percentage,
        pixels_plaie=wound_pixels,
        severite=severity,
        niveau_confiance=confidence_level,
        interpretations=interpretations,
        actions_recommandees=recommendations,
        contre_indications=contraindications,
        necessites_reevaluation=needs_reevaluation,
        delai_reevaluation=reevaluation_delay,
        version_modele="SimpleUNetV1",
    )

    return diagnostic
