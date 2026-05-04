import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { Role } from '../../core/models/role.enum';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { VisiteStore } from './visites.store';
import { DossierMedicalStore } from '../dossier-medical/dossier-medical.store';
import { VisiteStatus } from '../../core/models/visite.model';
import { ToastService } from '../../shared/services/toast.service';
import { BodyApiService } from '../../core/services/api/body-api.service';
import { BodyMapComponent } from '../../shared/components/body-map/body-map.component';
import { WoundAnalysisComponent } from '../../shared/components/wound-analysis/wound-analysis.component';
import { WoundAnalysisService } from '../../shared/services/wound-analysis.service';
import { environment } from '../../../environments/environment';
import { take } from 'rxjs';

type Mode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-visites-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    TextAreaComponent,
    LabelComponent,
    SelectComponent,
    BodyMapComponent,
    WoundAnalysisComponent,
  ],
  templateUrl: './visites-form-page.component.html',
  styleUrl: './visites-form-page.component.scss',
})
export class VisitesFormPageComponent implements OnInit {
  readonly env = environment;

  mode: Mode;
  submitted = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(VisiteStore);
  private readonly dossiersStore = inject(DossierMedicalStore);
  private readonly toastService = inject(ToastService);
  public readonly woundAnalysisService = inject(WoundAnalysisService);
  private readonly bodyApi = inject(BodyApiService);
  private readonly ngrxStore = inject(Store);

  userRole$ = this.ngrxStore.select(selectUserRole);
  protected readonly Role = Role;

  id: number | null;

  /*
  dossierOptions: Option[] = this.dossiersStore.getAll().map(d => ({
    value: String(d.id),
    label: `${d.nomPatient} (${d.numDossier})`
  }));
  */
  dossierOptions: Option[] = [];

  statusOptions: Option[] = [
    { value: 'OPEN', label: 'Ouverte' },
    { value: 'CLOSED', label: 'Clôturée' },
    { value: 'CANCELLED', label: 'Annulée' },
  ];

  typeVisiteOptions: Option[] = [
    { value: 'CONSULTATION', label: 'Consultation Normale' },
    { value: 'BLESSURE', label: 'Blessure / Accident' },
  ];

  typeBlessureOptions: Option[] = [
    { value: 'BRULURE', label: 'Brûlure' },
    { value: 'COUPURE', label: 'Coupure' },
    { value: 'FRACTURE', label: 'Fracture' },
    { value: 'PLAIE', label: 'Plaie' },
    { value: 'HEMATOME', label: 'Hématome' },
    { value: 'ENTORSE', label: 'Entorse' },
    { value: 'AUTRE', label: 'Autre' },
  ];

  form = {
    idDossier: '',
    idDoctor: 1, // Mock doctor
    status: 'OPEN' as VisiteStatus,
    typeVisite: 'CONSULTATION' as 'CONSULTATION' | 'BLESSURE',
    typeBlessure: '' as string,
    bodyParts: [] as string[],
    idBodyPart: null as number | null,
    planTraitement: '',
    observations: '',
  };

  // Analysis coordination
  analysisInProgress = false;
  lastAnalysisResult: import('../../shared/services/wound-analysis.service').WoundAnalysisResult | null = null;
  private _analysisResolver: ((value?: any) => void) | null = null;

  selectedBodyPartLabels: string[] = [];

  // When viewing an existing visite we show persisted artifact URLs here
  viewOriginalImageUrl: string | null = null;
  viewOverlayUrl: string | null = null;
  viewMaskUrl: string | null = null;

  // Wound analysis properties
  woundImageName: string = '';
  woundImageObjectName: string = '';
  woundImageFile: File | null = null;
  woundImagePreviewUrl: string = '';
  showWoundAnalysis = false;

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;
  }

  ngOnInit() {
    this.loadDossiers();

    if (this.mode !== 'create' && this.id != null) {
      this.store.getById(this.id).subscribe(existing => {
        if (!existing) {
          this.router.navigate(['/visites']);
          return;
        }
        this.form = {
          idDossier: String(existing.idDossier),
          idDoctor: existing.idDoctor,
          status: existing.status,
          typeVisite: existing.typeVisite || 'CONSULTATION',
          typeBlessure: existing.typeBlessure || '',
          bodyParts: existing.bodyParts
            ? existing.bodyParts
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => !!s)
            : [],
          idBodyPart: (existing as any).idBodyPart ?? null,
          planTraitement: existing.planTraitement,
          observations: existing.observations,
        };

        // Persisted overlay/mask URLs (for view mode display)
        this.viewOriginalImageUrl = (existing as any).originalImageUrl || null;
        this.viewOverlayUrl = (existing as any).overlayUrl || null;
        this.viewMaskUrl = (existing as any).maskUrl || null;

        if (this.isReadOnly && this.viewOriginalImageUrl) {
          this.woundImagePreviewUrl =
            this.woundAnalysisService.getImageUrl(this.viewOriginalImageUrl);

          this.woundImageName = 'Image originale';
        }

        if (this.form.idBodyPart != null) {
          this.loadBodyPartSelection(this.form.idBodyPart);
        }
      });
    } else if (this.mode === 'create') {
      const qDossierId = this.route.snapshot.queryParamMap.get('dossierId');
      if (qDossierId) {
        this.form.idDossier = qDossierId;
      }
    }
  }

  loadDossiers() {
    this.userRole$.pipe(take(1)).subscribe(role => {
      this.dossiersStore.getAll().subscribe(list => {
        const qDossierId = this.route.snapshot.queryParamMap.get('dossierId');
        const isSecretaire = role === Role.SECRETAIRE;
        
        this.dossierOptions = list
          .filter(d => {
            const matchesFilter = isSecretaire || !qDossierId || String(d.id) === qDossierId;
            const isActive = d.status === 'ACTIVE';
            const isCurrent = this.id != null && Number(this.form.idDossier) === d.id;
            
            // Pour une nouvelle visite, on ne veut que les dossiers actifs qui correspondent au filtre
            // Pour l'édition/vue, on garde aussi le dossier déjà sélectionné
            return (matchesFilter && isActive) || isCurrent;
          })
          .map(d => ({
            value: String(d.id),
            label: `${d.nomPatient} (${d.numDossier})`
          }));
      });
    });
  }

  private loadBodyPartSelection(idBodyPart: number): void {
    this.bodyApi.getBodyMap().subscribe({
      next: (sections) => {
        for (const section of sections) {
          const matchedPart = section.parts.find((part) => part.id === idBodyPart);
          if (!matchedPart) {
            continue;
          }

          this.form.bodyParts = [`${section.code}:${matchedPart.code}`];
          this.selectedBodyPartLabels = [matchedPart.label];
          return;
        }

        this.form.bodyParts = [];
        this.selectedBodyPartLabels = [];
      },
      error: (error) => {
        console.error('Error loading body map for selected part:', error);
      },
    });
  }

  onWoundAnalysisReady(event: any) {
    // Accept either a string summary (legacy) or the full { result, summary } event
    if (!event) return;

    if (typeof event === 'string') {
      this.form.observations = this.mergeAutoSummary(this.form.observations, event);
      return;
    }

    const { result, summary } = event as { result: import('../../shared/services/wound-analysis.service').WoundAnalysisResult; summary: string };
    this.lastAnalysisResult = result;
    this.analysisInProgress = false;
    this.form.observations = this.mergeAutoSummary(this.form.observations, summary);
    if (this._analysisResolver) {
      this._analysisResolver(result);
      this._analysisResolver = null;
    }
  }

  private mergeAutoSummary(currentObservations: string, summary: string): string {
    const trimmedCurrent = currentObservations.trim();
    const normalizedSummary = summary.trim();

    if (!trimmedCurrent) {
      return normalizedSummary;
    }

    const blockPattern = /Résumé IA \(généré automatiquement\) :[\s\S]*?Fin du résumé IA\s*/;
    const existingBlockIndex = trimmedCurrent.search(blockPattern);

    if (existingBlockIndex !== -1) {
      return trimmedCurrent.replace(blockPattern, `${normalizedSummary}\n\n`);
    }

    return `${normalizedSummary}\n\n${trimmedCurrent}`;
  }

  private getOriginalImageUrlToPersist(): string | undefined {
    return this.viewOriginalImageUrl || undefined;
  }

  private getOverlayUrlToPersist(): string | undefined {
    return this.lastAnalysisResult?.overlay_url || this.viewOverlayUrl || undefined;
  }

  private getMaskUrlToPersist(): string | undefined {
    return this.lastAnalysisResult?.mask_url || this.viewMaskUrl || undefined;
  }

  generateOrdonnance() {
    this.store.getById(this.id!).subscribe(existing => {
      if (existing) {
        this.dossiersStore.getById(existing.idDossier).subscribe(dossier => {
          this.router.navigate(['/ordonnances/new'], {
            queryParams: {
              patientId: dossier?.idPatient,
              visiteId: this.id
            }
          });
        });
      }
    });
  }

  get title(): string {
    if (this.mode === 'create') return 'Nouvelle Visite';
    if (this.mode === 'view') return 'Détails de la Visite';
    return 'Modifier la Visite';
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

get isValid(): boolean {
  if (this.isReadOnly) return true;

  const basicValid = this.form.idDossier !== '';
  const injuryValid = this.form.typeVisite === 'BLESSURE'
    ? !!this.form.typeBlessure
    : true;

  const traitementValid = !!this.form.planTraitement.trim();

  return basicValid && injuryValid && traitementValid;
}

  cancel() {
    const fromDossier = this.route.snapshot.queryParamMap.get('fromDossier');
    if (fromDossier) {
      this.router.navigate(['/dossier-medical', fromDossier]);
    } else {
      this.router.navigate(['/visites']);
    }
  }

  async save() {
    this.submitted = true;
    if (!this.isValid) return;

    const resolvedBodyPartId = await this.resolveSelectedBodyPartId();
    if (resolvedBodyPartId != null) {
      this.form.idBodyPart = resolvedBodyPartId;
    }

    const payload: import('../../core/models/visite.model').VisiteCreateDto = {
      idDossier: Number(this.form.idDossier),
      idDoctor: this.form.idDoctor,
      status: this.form.status,
      typeVisite: this.form.typeVisite,
      typeBlessure: this.form.typeBlessure || null,
      bodyParts: this.form.bodyParts.length > 0 ? this.form.bodyParts.join(',') : null,
      idBodyPart: this.form.idBodyPart || null,
      planTraitement: this.form.planTraitement,
      observations: this.form.observations,
      overlayUrl: this.getOverlayUrlToPersist(),
      maskUrl: this.getMaskUrlToPersist(),
      originalImageUrl: this.getOriginalImageUrlToPersist(),
    };

    // If we have a wound image selected, we want to ensure analysis is run
    // and results (summary + overlay/mask URLs) are available before finalizing.
    const needsAnalysis = !!this.woundImageFile;

    if (this.mode === 'create') {
      // Create initial visit to obtain an ID required by the analysis API
      this.store.create(payload).subscribe({
        next: async (created) => {
          this.id = created.id;
          this.mode = 'edit';

          if (needsAnalysis) {
            try {
              await this.ensureOriginalImageUploaded(this.id!);

              // Show the analysis component and wait for result
              this.showWoundAnalysis = true;
              this.analysisInProgress = true;
              const result = await this.waitForAnalysis();

              this.store.update(this.id!, {
                idDossier: Number(this.form.idDossier),
                idDoctor: this.form.idDoctor,
                bodyParts: this.form.bodyParts.length > 0 ? this.form.bodyParts.join(',') : null,
                idBodyPart: this.form.idBodyPart || null,
                observations: this.form.observations,
                overlayUrl: result.overlay_url || this.viewOverlayUrl || undefined,
                maskUrl: result.mask_url || this.viewMaskUrl || undefined,
                originalImageUrl: this.getOriginalImageUrlToPersist(),
                planTraitement: this.form.planTraitement,
                typeVisite: this.form.typeVisite,
                typeBlessure: this.form.typeBlessure,
              }).subscribe({
                next: () => {
                  this.toastService.success('Succès', 'Visite enregistrée avec résultats d\'analyse');
                },
                error: () => this.toastService.error('Erreur', 'Erreur lors de l\'enregistrement des résultats')
              });
            } catch (e) {
              this.toastService.error('Erreur', 'Analyse introuvable ou erreur lors de l\'analyse');
            }
          } else {
            if (this.woundImageFile) {
              try {
                await this.ensureOriginalImageUploaded(this.id!);
                this.store.update(this.id!, {
                  idDossier: Number(this.form.idDossier),
                  idDoctor: this.form.idDoctor,
                  bodyParts: this.form.bodyParts.length > 0 ? this.form.bodyParts.join(',') : null,
                  idBodyPart: this.form.idBodyPart || null,
                  observations: this.form.observations,
                  overlayUrl: undefined,
                  maskUrl: undefined,
                  originalImageUrl: this.getOriginalImageUrlToPersist(),
                  planTraitement: this.form.planTraitement,
                  typeVisite: this.form.typeVisite,
                  typeBlessure: this.form.typeBlessure,
                }).subscribe();
              } catch {
                this.toastService.error('Erreur', 'Le téléversement de l\'image de plaie a échoué.');
                return;
              }
            }
            this.toastService.success('Succès', 'Visite enregistrée avec succès');
          }
        },
        error: (err) => {
          console.error(err);
          const msg = this.extractErrorMessage(err);
          this.toastService.error('Erreur', msg || 'Erreur lors de l\'enregistrement');
        }
      });
    } else if (this.id != null) {
      if (needsAnalysis) {
        try {
          await this.ensureOriginalImageUploaded(this.id);
          this.showWoundAnalysis = true;
          if (!this.lastAnalysisResult) {
            this.analysisInProgress = true;
          }
          await this.waitForAnalysis();
        } catch (e) {
          this.toastService.error('Erreur', 'Erreur lors de l\'analyse');
        }
      }

      if (this.woundImageFile && !this.viewOriginalImageUrl) {
        try {
          await this.ensureOriginalImageUploaded(this.id);
        } catch {
          this.toastService.error('Erreur', 'Le téléversement de l\'image de plaie a échoué.');
          return;
        }
      }

      // Save the (possibly updated) visit
      this.store.update(this.id, { idDossier: Number(this.form.idDossier), idDoctor: this.form.idDoctor, bodyParts: this.form.bodyParts.length > 0 ? this.form.bodyParts.join(',') : null, idBodyPart: this.form.idBodyPart || null, observations: this.form.observations, planTraitement: this.form.planTraitement, typeVisite: this.form.typeVisite, typeBlessure: this.form.typeBlessure, overlayUrl: this.getOverlayUrlToPersist(), maskUrl: this.getMaskUrlToPersist(), originalImageUrl: this.getOriginalImageUrlToPersist() }).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Visite mise à jour avec succès');
          this.router.navigate(['/visites']);
        },
        error: (err) => {
          console.error(err);
          const msg = this.extractErrorMessage(err);
          this.toastService.error('Erreur', msg || 'Erreur lors de la mise à jour');
        }
      });
    }
  }
  private extractErrorMessage(err: any): string | null {
    if (err.error?.data && typeof err.error.data === 'object') {
      const errors = err.error.data;
      return Object.values(errors).join('\n');
    }
    return err.error?.message || err.message || null;
  }

  private waitForAnalysis(timeout = 60000): Promise<import('../../shared/services/wound-analysis.service').WoundAnalysisResult> {
    if (this.lastAnalysisResult) return Promise.resolve(this.lastAnalysisResult);

    return new Promise((resolve, reject) => {
      this._analysisResolver = resolve;
      // Timeout handling
      const t = setTimeout(() => {
        if (this._analysisResolver) {
          this._analysisResolver = null;
        }
        reject(new Error('Analysis timeout'));
      }, timeout);

      // Replace resolver to clear timeout
      const originalResolver = this._analysisResolver;
      this._analysisResolver = (val?: any) => {
        clearTimeout(t);
        originalResolver && originalResolver(val);
      };
    });
  }

  // Note: image URLs are persisted to the visit record (overlayUrl/maskUrl)
  // and displayed in view mode; they are no longer appended to observations.

  // Wound analysis methods
  onWoundImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (this.woundImagePreviewUrl) {
      URL.revokeObjectURL(this.woundImagePreviewUrl);
    }

    this.woundImageFile = file;
    this.woundImageName = file.name;
    this.woundImagePreviewUrl = URL.createObjectURL(file);

    this.lastAnalysisResult = null;
    this.viewOverlayUrl = null;
    this.viewMaskUrl = null;

    // reset analysis if needed
    this.showWoundAnalysis = false;
  }

  private async ensureOriginalImageUploaded(visitId: number) {
    if (!this.woundImageFile) return;

    const response = await firstValueFrom(
      this.woundAnalysisService.uploadWoundImage(this.woundImageFile, visitId)
    );

    this.woundImageObjectName = response.object_name;
    this.viewOriginalImageUrl = response.object_url;
  }

  private async resolveSelectedBodyPartId(): Promise<number | null> {
    if (this.form.idBodyPart != null || this.form.bodyParts.length === 0) {
      return this.form.idBodyPart;
    }

    const sections = await firstValueFrom(this.bodyApi.getBodyMap());
    const firstSelection = this.form.bodyParts[0];
    const [sectionCode, partCode] = firstSelection.includes(':') ? firstSelection.split(':', 2) : ['', firstSelection];

    for (const section of sections) {
      if (sectionCode && section.code !== sectionCode) continue;
      const part = section.parts.find(p => p.code === partCode);
      if (part?.id != null) {
        return part.id;
      }
    }

    return null;
  }

  triggerWoundImageUpload() {
    const input = document.getElementById('woundImageInput') as HTMLInputElement;
    input?.click();
  }

  onWoundImageBoxClick() {
    if (this.isReadOnly) {
      return;
    }

    this.triggerWoundImageUpload();
  }

}


