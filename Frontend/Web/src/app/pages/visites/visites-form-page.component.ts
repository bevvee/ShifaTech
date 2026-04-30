import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
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
import { BodyMapComponent } from '../../shared/components/body-map/body-map.component';
import { WoundAnalysisComponent } from '../../shared/components/wound-analysis/wound-analysis.component';
import { environment } from '../../../environments/environment';

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
    planTraitement: '',
    observations: '',
  };

  // Wound analysis properties
  woundImageName: string = '';
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
          planTraitement: existing.planTraitement,
          observations: existing.observations,
        };
      });
    } else if (this.mode === 'create') {
      const qDossierId = this.route.snapshot.queryParamMap.get('dossierId');
      if (qDossierId) {
        this.form.idDossier = qDossierId;
      }
    }
  }

  loadDossiers() {
    this.dossiersStore.getAll().subscribe(list => {
      const qDossierId = this.route.snapshot.queryParamMap.get('dossierId');
      
      this.dossierOptions = list
        .filter(d => !qDossierId || String(d.id) === qDossierId || this.mode !== 'create')
        .map(d => ({
          value: String(d.id),
          label: `${d.nomPatient} (${d.numDossier})`
        }));
    });
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
    const injuryValid = this.form.typeVisite === 'BLESSURE' ? !!this.form.typeBlessure : true;
    
    return basicValid && injuryValid;
  }

  cancel() {
    const fromDossier = this.route.snapshot.queryParamMap.get('fromDossier');
    if (fromDossier) {
      this.router.navigate(['/dossier-medical', fromDossier]);
    } else {
      this.router.navigate(['/visites']);
    }
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const payload: import('../../core/models/visite.model').VisiteCreateDto = {
      idDossier: Number(this.form.idDossier),
      idDoctor: this.form.idDoctor,
      status: this.form.status,
      typeVisite: this.form.typeVisite,
      typeBlessure: this.form.typeBlessure || null,
      bodyParts: this.form.bodyParts.length > 0 ? this.form.bodyParts.join(',') : null,
      planTraitement: this.form.planTraitement,
      observations: this.form.observations,
    };

    if (this.mode === 'create') {
      this.store.create(payload).subscribe({
        next: (created) => {
          this.id = created.id;
          this.mode = 'edit';
          this.toastService.success('Succès', 'Visite enregistrée avec succès');
        },
        error: () => this.toastService.error('Erreur', 'Erreur lors de l\'enregistrement')
      });
    } else if (this.id != null) {
      this.store.update(this.id, payload).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Visite mise à jour avec succès');
          this.router.navigate(['/visites']);
        },
        error: () => this.toastService.error('Erreur', 'Erreur lors de la mise à jour')
      });
    }
  }

  // Wound analysis methods
  onWoundImageSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (this.woundImagePreviewUrl) {
        URL.revokeObjectURL(this.woundImagePreviewUrl);
      }

      this.woundImageFile = files[0];
      if (this.woundImageFile) {
        this.woundImageName = this.woundImageFile.name;
        this.woundImagePreviewUrl = URL.createObjectURL(this.woundImageFile);
        this.uploadWoundImage();
      }
    }
  }

  uploadWoundImage() {
    if (!this.woundImageFile) return;

    // In a real scenario, you would upload the image to MinIO or your backend
    // For now, we'll just set the image name which will trigger analysis
    this.showWoundAnalysis = true;
    
    // If visit has an ID, we can analyze directly
    // Otherwise, we'll analyze after the visit is created
    if (this.id) {
      // Analysis will happen automatically with app-wound-analysis component
    }
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

  getVisitIdForAnalysis(): number {
    return this.id || 0;
  }
}

