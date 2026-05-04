import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface MedicalDiagnostic {
  titre: string;
  date_analyse: string;
  pourcentage_plaie: number;
  pixels_plaie: number;
  severite: 'minimal' | 'limité' | 'modéré' | 'étendu';
  niveau_confiance: 'faible' | 'moyen' | 'élevé';
  interpretations: string[];
  actions_recommandees: string[];
  contre_indications: string[];
  necessites_reevaluation: boolean;
  delai_reevaluation?: string;
  version_modele: string;
}

export interface WoundConfidence {
  max_probability: number;
  mean_probability: number;
  threshold_used: number;
  low_confidence: boolean;
}

export interface WoundAnalysisResult {
  visit_id: number;
  wound_pixels: number;
  wound_percentage: number;
  confidence: WoundConfidence;
  diagnostic: MedicalDiagnostic;
  uncertainty_status: string;
  mask_suppressed: boolean;
  retraining_case_queued: boolean;
  mask_url?: string;
  overlay_url?: string;
  report_url?: string;
}

export interface WoundAnalysisResponse {
  visit_id: number;
  result: WoundAnalysisResult;
}

export interface WoundUploadResponse {
  object_name: string;
  object_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class WoundAnalysisService {
  private http = inject(HttpClient);
  private readonly API_BASE = environment.api.wound;

  private readonly severityTypeMap: Record<MedicalDiagnostic['severite'], string> = {
    minimal: 'superficielle',
    'limité': 'superficielle',
    'modéré': 'modérée',
    'étendu': 'étendue',
  };

  /**
   * Analyze wound image from a visit
   */
  analyzeWound(imageName: string, visitId: number) {
    return this.http.post<WoundAnalysisResponse>(`${this.API_BASE}/analyze-wound`, {
      image_name: imageName,
      visit_id: visitId
    });
  }

  uploadWoundImage(file: File, visitId: number) {
    const formData = new FormData();
    formData.append('image', file, file.name);
    formData.append('visit_id', String(visitId));

    return this.http.post<WoundUploadResponse>(`${this.API_BASE}/upload-image`, formData);
  }

  /**
   * Check API health
   */
  checkHealth() {
    return this.http.get(`${this.API_BASE}/health`);
  }

  /**
   * Get public URL for image (accessible from frontend)
   */
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';

    // Legacy records may store raw MinIO API URLs. Route those through the
    // wound service so the browser receives a presigned redirect instead.
    if (imageUrl.includes('/wound-images/') && !imageUrl.includes('X-Amz-Algorithm=')) {
      return `${this.API_BASE}/signed-url?object_name=${encodeURIComponent(imageUrl)}`;
    }

    return imageUrl;
  }

  /**
   * Get severity color based on classification
   */
  getSeverityColor(severity: string): string {
    const colors = {
      'minimal': '#10b981',    // Green
      'limité': '#f59e0b',     // Amber
      'modéré': '#f97316',     // Orange
      'étendu': '#ef4444'      // Red
    };
    return colors[severity as keyof typeof colors] || '#6b7280';
  }

  /**
   * Get severity label in French
   */
  getSeverityLabel(severity: string): string {
    const labels = {
      'minimal': 'Plaie minimale ✓',
      'limité': 'Plaie limitée ⚠️',
      'modéré': 'Plaie modérée ⚠️',
      'étendu': 'Plaie extensive 🔴'
    };
    return labels[severity as keyof typeof labels] || severity;
  }

  /**
   * Get confidence label in French
   */
  getConfidenceLabel(confidence: string): string {
    const labels = {
      'faible': 'Faible (❌)',
      'moyen': 'Moyen (⚠️)',
      'élevé': 'Élevé (✅)'
    };
    return labels[confidence as keyof typeof labels] || confidence;
  }

  getWoundTypeLabel(severity: MedicalDiagnostic['severite']): string {
    return this.severityTypeMap[severity] || 'superficielle';
  }

  buildClinicalSummary(result: WoundAnalysisResult, localisation: string): string {
    const severity = result.diagnostic.severite;
    const typeDePlaie = this.getWoundTypeLabel(severity);
    const localisationLabel = localisation.trim() || 'Non renseignée';
    const confidencePercent = Math.round((result.confidence.max_probability || 0) * 100);
    const confidenceLabel = this.getConfidenceLabel(result.diagnostic.niveau_confiance);

    const interpretation = this.getClinicalInterpretation(severity, confidencePercent);

    return [
      'Résumé (généré automatiquement) :',
      `- Localisation: ${localisationLabel}`,
      `- Type de plaie: ${typeDePlaie}`,
      `- Surface en %: ${result.diagnostic.pourcentage_plaie.toFixed(2)}%`,
      `- Pixel count: ${result.diagnostic.pixels_plaie}`,
      '- Aire réelle: non disponible (absence d’échelle de calibration)',
      `- Interprétation clinique: ${interpretation}`,
    ].join('\n');
  }

  private getClinicalInterpretation(severity: MedicalDiagnostic['severite'], confidencePercent: number): string {
    const interpretationBySeverity: Record<MedicalDiagnostic['severite'], string> = {
      minimal: 'Aspect compatible avec une plaie superficielle à extension limitée.',
      'limité': 'Aspect compatible avec une plaie localisée nécessitant surveillance clinique.',
      'modéré': 'Aspect compatible avec une plaie modérée à suivre de près.',
      'étendu': 'Aspect compatible avec une plaie étendue nécessitant une prise en charge rapide.',
    };

    const baseText = interpretationBySeverity[severity] || 'Aspect compatible avec une lésion à confirmer par évaluation clinique.';

    if (confidencePercent < 60) {
      return `${baseText} Interprétation prudente en raison d’une confiance limitée.`;
    }

    return baseText;
  }
}
