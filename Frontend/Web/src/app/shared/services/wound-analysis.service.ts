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

@Injectable({
  providedIn: 'root'
})
export class WoundAnalysisService {
  private http = inject(HttpClient);
  private readonly API_BASE = environment.api.wound;

  /**
   * Analyze wound image from a visit
   */
  analyzeWound(imageName: string, visitId: number) {
    return this.http.post<WoundAnalysisResponse>(`${this.API_BASE}/analyze-wound`, {
      image_name: imageName,
      visit_id: visitId
    });
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
}
