import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { ToastService } from '../../shared/services/toast.service';

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
export class VisitesFormPageComponent implements OnInit {
  mode: Mode;
  submitted = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(VisiteStore);
  private readonly dossiersStore = inject(DossierMedicalStore);
  private readonly toastService = inject(ToastService);

  private id: number | null;

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
    idBodyPart: null as number | null,
    planTraitement: '',
    observations: '',
  };

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
          idBodyPart: existing.idBodyPart || null,
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
      this.dossierOptions = list.map(d => ({
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
    this.router.navigate(['/visites']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const payload = {
      ...this.form,
      idDossier: Number(this.form.idDossier)
    };

    /*
    if (this.mode === 'create') {
      this.store.create(payload);
    } else if (this.id != null) {
      this.store.update(this.id, payload);
    }

    this.router.navigate(['/visites']);
    */

    if (this.mode === 'create') {
      this.store.create(payload).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Visite enregistrée avec succès');
          this.router.navigate(['/visites']);
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
}
