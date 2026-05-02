import { Component, Input, OnInit, inject } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WoundAnalysisService, WoundAnalysisResult } from '../../services/wound-analysis.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-wound-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wound-analysis.component.html',
  styleUrls: ['./wound-analysis.component.scss']
})
export class WoundAnalysisComponent implements OnInit {
  @Input() visitId: number = 0;
  @Input() imageName: string = '';
  @Input() autoAnalyze: boolean = true;
  @Input() localisation: string = '';

  @Output() analysisReady = new EventEmitter<{ result: WoundAnalysisResult; summary: string }>();

  woundService = inject(WoundAnalysisService);
  private toastService = inject(ToastService);

  isLoading = false;
  result: WoundAnalysisResult | null = null;
  error: string | null = null;

  ngOnInit() {
    if (this.autoAnalyze && this.imageName && this.visitId) {
      this.analyze();
    }
  }

  analyze() {
    if (!this.imageName || !this.visitId) {
      this.error = 'Image name and visit ID are required';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.woundService.analyzeWound(this.imageName, this.visitId)
      .subscribe({
        next: (response) => {
          this.result = response.result;
          this.isLoading = false;
          this.analysisReady.emit({
            result: response.result,
            summary: this.woundService.buildClinicalSummary(response.result, this.localisation),
          });
          this.toastService.success(
            'Analyse Complète',
            `Sévérité: ${this.result.diagnostic.severite}`
          );
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.detail || error.message || 'Erreur lors de l\'analyse';
          this.toastService.error('Erreur', this.error || 'Erreur inconnue');
        }
      });
  }

  getSeverityColor(severity: string): string {
    return this.woundService.getSeverityColor(severity);
  }

  getSeverityLabel(severity: string): string {
    return this.woundService.getSeverityLabel(severity);
  }

  getConfidenceLabel(confidence: string): string {
    return this.woundService.getConfidenceLabel(confidence);
  }

  isUrgent(): boolean {
    return this.result?.diagnostic?.severite === 'étendu';
  }

  isLowConfidence(): boolean {
    return this.result?.diagnostic?.niveau_confiance === 'faible';
  }

  retry() {
    this.analyze();
  }
}
