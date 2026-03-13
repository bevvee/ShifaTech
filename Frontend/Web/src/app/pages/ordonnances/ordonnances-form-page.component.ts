import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { OrdonnanceStore } from './ordonnances.store';
import { PatientsStore } from '../patients/patients.store';
import { VisiteStore } from '../visites/visites.store';
import { OrdonnanceStatut } from '../../core/models/ordonnance.model';

type Mode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-ordonnances-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    InputFieldComponent,
    TextAreaComponent,
    LabelComponent,
    SelectComponent,
  ],
  templateUrl: './ordonnances-form-page.component.html'
})
export class OrdonnancesFormPageComponent {
  mode: Mode;
  submitted = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(OrdonnanceStore);
  private readonly patientsStore = inject(PatientsStore);
  private readonly visitesStore = inject(VisiteStore);

  private id: number | null;

  patientOptions: Option[] = [];

  visiteOptions: Option[] = this.visitesStore.getAll().map(v => ({
    value: String(v.id),
    label: `Visite du ${v.dateCreation ? v.dateCreation.substring(0, 10) : 'Date inconnue'} - ${v.nomPatient}`
  }));

  statutOptions: Option[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'EXPIRED', label: 'Expirée' },
    { value: 'CANCELLED', label: 'Annulée' },
  ];

  form = {
    idPatient: '',
    idDoctor: 1,
    idVisite: '',
    description: '',
    medicaments: '',
    posologie: '',
    dureeTraitement: '',
    instructions: '',
    dateValidite: '',
    statut: 'ACTIVE' as OrdonnanceStatut,
  };

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    if (this.mode !== 'create' && this.id != null) {
      const existing = this.store.getById(this.id);
      if (!existing) {
        this.router.navigate(['/ordonnances']);
        return;
      }
      this.form = {
        idPatient: String(existing.idPatient),
        idDoctor: existing.idDoctor,
        idVisite: String(existing.idVisite),
        description: existing.description,
        medicaments: existing.medicaments,
        posologie: existing.posologie,
        dureeTraitement: existing.dureeTraitement,
        instructions: existing.instructions,
        dateValidite: existing.dateValidite,
        statut: existing.statut,
      };
    } else if (this.mode === 'create') {
      const qPatientId = this.route.snapshot.queryParamMap.get('patientId');
      const qVisiteId = this.route.snapshot.queryParamMap.get('visiteId');
      if (qPatientId) this.form.idPatient = qPatientId;
      if (qVisiteId) this.form.idVisite = qVisiteId;
    }

    this.loadPatients();
  }

  loadPatients() {
    this.patientsStore.getAll().subscribe(list => {
      this.patientOptions = list.map(p => ({
        value: String(p.id),
        label: `${p.nom} ${p.prenom} (${p.numDossier})`
      }));
    });
  }

  get title(): string {
    if (this.mode === 'create') return 'Nouvelle Ordonnance';
    if (this.mode === 'view') return 'Détails de l\'Ordonnance';
    return 'Modifier l\'Ordonnance';
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  get isValid(): boolean {
    if (this.isReadOnly) return true;
    return (
      this.form.idPatient !== '' &&
      this.form.medicaments.trim().length > 0 &&
      this.form.dateValidite !== ''
    );
  }

  cancel() {
    this.router.navigate(['/ordonnances']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const payload = {
      ...this.form,
      idPatient: Number(this.form.idPatient),
      idVisite: this.form.idVisite ? Number(this.form.idVisite) : undefined
    };

    if (this.mode === 'create') {
      this.store.create(payload as any); // Use any for now as other stores aren't async yet
    } else if (this.id != null) {
      this.store.update(this.id, payload as any);
    }

    this.router.navigate(['/ordonnances']);
  }
}
