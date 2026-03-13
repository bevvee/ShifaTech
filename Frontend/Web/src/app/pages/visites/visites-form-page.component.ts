import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { VisiteStore } from './visites.store';
import { DossierMedicalStore } from '../dossier-medical/dossier-medical.store';
import { VisiteStatus } from '../../core/models/visite.model';

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
  ],
  templateUrl: './visites-form-page.component.html'
})
export class VisitesFormPageComponent {
  mode: Mode;
  submitted = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(VisiteStore);
  private readonly dossiersStore = inject(DossierMedicalStore);

  private id: number | null;

  dossierOptions: Option[] = this.dossiersStore.getAll().map(d => ({
    value: String(d.id),
    label: `${d.nomPatient} (${d.numDossier})`
  }));

  statusOptions: Option[] = [
    { value: 'OPEN', label: 'Ouverte' },
    { value: 'CLOSED', label: 'Clôturée' },
    { value: 'CANCELLED', label: 'Annulée' },
  ];

  form = {
    idDossier: '',
    idDoctor: 1, // Mock doctor
    status: 'OPEN' as VisiteStatus,
    planTraitement: '',
    observations: '',
  };

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    if (this.mode !== 'create' && this.id != null) {
      const existing = this.store.getById(this.id);
      if (!existing) {
        this.router.navigate(['/visites']);
        return;
      }
      this.form = {
        idDossier: String(existing.idDossier),
        idDoctor: existing.idDoctor,
        status: existing.status,
        planTraitement: existing.planTraitement,
        observations: existing.observations,
      };
    } else if (this.mode === 'create') {
      const qDossierId = this.route.snapshot.queryParamMap.get('dossierId');
      if (qDossierId) {
        this.form.idDossier = qDossierId;
      }
    }
  }

  generateOrdonnance() {
    const existing = this.store.getById(this.id!);
    if (existing) {
      this.router.navigate(['/ordonnances/new'], { 
        queryParams: { 
          patientId: this.dossiersStore.getById(existing.idDossier)?.idPatient,
          visiteId: this.id
        } 
      });
    }
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
    return this.form.idDossier !== '' && this.form.planTraitement.trim().length > 0;
  }

  cancel() {
    this.router.navigate(['/visites']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const payload = {
      ...this.form,
      idDossier: Number(this.form.idDossier)
    };

    if (this.mode === 'create') {
      this.store.create(payload);
    } else if (this.id != null) {
      this.store.update(this.id, payload);
    }

    this.router.navigate(['/visites']);
  }
}
