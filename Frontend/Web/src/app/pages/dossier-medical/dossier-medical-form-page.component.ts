import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { DossierMedicalStore } from './dossier-medical.store';
import { PatientsStore } from '../patients/patients.store';
import { VisiteStore } from '../visites/visites.store';
import { OrdonnanceStore } from '../ordonnances/ordonnances.store';
import { DossierStatus, GroupeSanguin, DossierMedicalDto } from '../../core/models/dossier-medical.model';
import { VisiteDto } from '../../core/models/visite.model';
import { OrdonnanceDto } from '../../core/models/ordonnance.model';
import { ToastService } from '../../shared/services/toast.service';

type Mode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-dossier-medical-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    InputFieldComponent,
    TextAreaComponent,
    LabelComponent,
    SelectComponent,
  ],
  templateUrl: './dossier-medical-form-page.component.html'
})
export class DossierMedicalFormPageComponent implements OnInit {
  mode: Mode;
  submitted = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(DossierMedicalStore);
  private readonly patientsStore = inject(PatientsStore);
  private readonly visitesStore = inject(VisiteStore);
  private readonly ordonnancesStore = inject(OrdonnanceStore);
  private readonly toastService = inject(ToastService);

  private id: number | null;
  
  linkedVisites: VisiteDto[] = [];
  linkedOrdonnances: OrdonnanceDto[] = [];

  patientOptions: Option[] = [];

  statusOptions: Option[] = [
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'ARCHIVED', label: 'ARCHIVED' },
    { value: 'DECEASED', label: 'DECEASED' },
  ];

  groupeSanguinOptions: Option[] = [
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
  ];

  form = {
    idPatient: '',
    status: 'ACTIVE' as DossierStatus,
    poids: 0,
    taille: 0,
    groupeSanguin: 'O+' as GroupeSanguin,
    antecedentsMedicaux: '',
    allergies: '',
    pathologiesChroniques: '',
    diagnostic: '',
    notes: '',
  };

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    // Handle Query Params for pre-selection
    const qPatientId = this.route.snapshot.queryParamMap.get('patientId');
    if (this.mode === 'create' && qPatientId) {
      this.form.idPatient = qPatientId;
    }

    /*
    if (this.mode !== 'create' && this.id != null) {
      const existing = this.store.getById(this.id);
      if (!existing) {
        this.router.navigate(['/dossier-medical']);
        return;
      }
      this.form = {
        idPatient: String(existing.idPatient),
        status: existing.status,
        poids: existing.poids,
        taille: existing.taille,
        groupeSanguin: existing.groupeSanguin,
        antecedentsMedicaux: existing.antecedentsMedicaux,
        allergies: existing.allergies,
        pathologiesChroniques: existing.pathologiesChroniques,
        diagnostic: existing.diagnostic,
        notes: existing.notes,
      };

      // Load History
      this.linkedVisites = this.visitesStore.getByDossierId(this.id);
      this.linkedOrdonnances = this.ordonnancesStore.getByPatientId(existing.idPatient);
    }
    */

    this.loadPatients();
  }

  ngOnInit() {
    if (this.mode !== 'create' && this.id != null) {
      this.store.getById(this.id).subscribe({
        next: (existing) => {
          if (!existing) {
            this.router.navigate(['/dossier-medical']);
            return;
          }
          this.form = {
            idPatient: String(existing.idPatient),
            status: existing.status,
            poids: existing.poids,
            taille: existing.taille,
            groupeSanguin: existing.groupeSanguin,
            antecedentsMedicaux: existing.antecedentsMedicaux,
            allergies: existing.allergies,
            pathologiesChroniques: existing.pathologiesChroniques,
            diagnostic: existing.diagnostic,
            notes: existing.notes,
          };

          // Load History (Mocks for now)
          /*
          this.linkedVisites = this.visitesStore.getByDossierId(this.id!);
          */
          this.visitesStore.getByDossierId(this.id!).subscribe(list => {
            this.linkedVisites = list;
          });
          
          /*
          this.linkedOrdonnances = this.ordonnancesStore.getByPatientId(existing.idPatient);
          */
          this.ordonnancesStore.getByPatientId(existing.idPatient).subscribe(list => {
            this.linkedOrdonnances = list;
          });
        },
        error: (err) => {
          console.error('Erreur chargement dossier', err);
          this.router.navigate(['/dossier-medical']);
        }
      });
    }
  }

  loadPatients() {
    this.patientsStore.getAll().subscribe(list => {
      this.patientOptions = list.map(p => ({
        value: String(p.id),
        label: `${p.nom} ${p.prenom} (${p.numDossier})`
      }));
    });
  }

  createVisite() {
    this.router.navigate(['/visites/new'], { queryParams: { dossierId: this.id } });
  }

  get title(): string {
    if (this.mode === 'create') return 'Nouveau Dossier Médical';
    if (this.mode === 'view') return 'Détails du Dossier';
    return 'Modifier le Dossier';
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  get isValid(): boolean {
    if (this.isReadOnly) return true;
    return this.form.idPatient !== '' && this.form.poids > 0 && this.form.taille > 0;
  }

  cancel() {
    this.router.navigate(['/dossier-medical']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    if (this.isReadOnly) {
      this.cancel();
      return;
    }

    const payload = {
      ...this.form,
      idPatient: Number(this.form.idPatient)
    };

    /*
    if (this.mode === 'create') {
      this.store.create(payload);
    } else if (this.id != null) {
      this.store.update(this.id, payload);
    }
    this.router.navigate(['/dossier-medical']);
    */

    if (this.mode === 'create') {
      this.store.create(payload).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Dossier créé avec succès');
          this.router.navigate(['/dossier-medical']);
        },
        error: () => this.toastService.error('Erreur', 'Erreur lors de la création')
      });
    } else if (this.id != null) {
      this.store.update(this.id, payload).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Dossier mis à jour avec succès');
          this.router.navigate(['/dossier-medical']);
        },
        error: () => this.toastService.error('Erreur', 'Erreur lors de la mise à jour')
      });
    }
  }
}
