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
import { OrdonnanceDto, OrdonnanceStatut } from '../../core/models/ordonnance.model';
import { PatientDto } from '../../core/models/patient.model';
import { DossierMedicalStore } from '../dossier-medical/dossier-medical.store';
import { DossierMedicalDto } from '../../core/models/dossier-medical.model';
import { AlertService } from '../../core/services/alert.service';

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
  private readonly dossierStore = inject(DossierMedicalStore);
  private readonly alerts = inject(AlertService);

  private id: number | null;

  patientOptions: Option[] = [];

  patient: PatientDto | null = null;
  dossier: DossierMedicalDto | null = null;

  ordonnance: OrdonnanceDto | null = null;

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

      this.ordonnance = existing;

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

      const patientId = Number(existing.idPatient);
      this.dossier = Number.isFinite(patientId) ? (this.dossierStore.getByPatientId(patientId) ?? null) : null;
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

      const idPatient = Number(this.form.idPatient);
      this.patient = Number.isFinite(idPatient) ? (list.find((p) => p.id === idPatient) ?? null) : null;
      this.dossier = this.patient ? (this.dossierStore.getByPatientId(this.patient.id) ?? null) : null;
    });
  }

  get title(): string {
    if (this.mode === 'create') return 'Nouvelle Ordonnance';
    if (this.mode === 'view') return 'Patient Details';
    return 'Modifier l\'Ordonnance';
  }

  get patientDisplayName(): string {
    const p = this.patient;
    if (!p) {
      const fallback = (this.ordonnance?.nomPatient ?? '').trim();
      return fallback || '-';
    }
    const prenom = (p.prenom ?? '').trim();
    const nom = (p.nom ?? '').trim();
    if (!prenom && !nom) return '-';

    const prefix = p.sexe === 'M' ? 'M.' : p.sexe === 'F' ? 'Mme.' : '';
    return `${prefix}${prefix ? '' : ''}${prenom ? prenom + ' ' : ''}${nom}`.trim();
  }

  get patientAgeYears(): number | null {
    const raw = this.patient?.dateNaissance;
    if (!raw) return null;
    const dob = new Date(raw);
    if (Number.isNaN(dob.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years -= 1;
    return years >= 0 ? years : null;
  }

  get patientSexLabel(): string {
    const s = this.patient?.sexe;
    if (s === 'M') return 'Male';
    if (s === 'F') return 'Female';
    return '-';
  }

  get patientBloodGroup(): string {
    const raw = String((this.dossier?.groupeSanguin as string) || '').trim();
    if (!raw) return '-';
    // Render like "O+ve" to match the screenshot style.
    if (raw.endsWith('+') || raw.endsWith('-')) return `${raw}ve`;
    return raw;
  }

  get patientPrettyId(): string {
    const id = this.patient?.id ?? Number(this.form.idPatient);
    if (!Number.isFinite(id) || !id) return '-';
    return `PT${String(id).padStart(4, '0')}`;
  }

  get prescriptionTitle(): string {
    return this.form.description?.trim() ? this.form.description.trim() : 'Prescription';
  }

  get medicationRows(): Array<{
    sno: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    timings: string;
  }> {
    const meds = String(this.form.medicaments ?? '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const duration = this.form.dureeTraitement?.trim() || '-';
    const timings = this.form.instructions?.trim() || '-';

    return meds.map((medicineName, idx) => {
      const sno = String(idx + 1).padStart(2, '0');
      const { dosage, frequency } = this.extractDosageAndFrequency(medicineName, this.form.posologie);
      return {
        sno,
        medicineName,
        dosage,
        frequency,
        duration,
        timings,
      };
    });
  }

  private extractDosageAndFrequency(medicine: string, posologie: string): { dosage: string; frequency: string } {
    const med = String(medicine ?? '').trim();
    const pos = String(posologie ?? '').trim();

    // Try to find a dosage token like "75MG" / "90 mg" / "2.5 ml" in either medicine name or posologie.
    const dosageMatch = (med + ' ' + pos).match(/\b\d+(?:[.,]\d+)?\s*(?:MG|G|MCG|ML|IU)\b/i);
    const dosage = dosageMatch ? dosageMatch[0].replace(/\s+/g, ' ').trim() : '-';

    // Try to extract frequency pattern like 1-0-1.
    const freqMatch = pos.match(/\b\d\s*-\s*\d\s*-\s*\d\b/);
    const frequency = freqMatch ? freqMatch[0].replace(/\s+/g, '') : (pos ? pos : '-');

    return { dosage, frequency };
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

  async save() {
    this.submitted = true;
    if (!this.isValid) return;

    if (this.isReadOnly) {
      this.cancel();
      return;
    }

    const payload = {
      ...this.form,
      idPatient: Number(this.form.idPatient),
      idVisite: this.form.idVisite ? Number(this.form.idVisite) : undefined
    };

    try {
      if (this.mode === 'create') {
        this.store.create(payload as any); // Use any for now as other stores aren't async yet
        await this.alerts.success('Ordonnance ajoutée avec succès.');
      } else if (this.id != null) {
        this.store.update(this.id, payload as any);
        await this.alerts.success('Ordonnance modifiée avec succès.');
      }

      this.router.navigate(['/ordonnances']);
    } catch {
      await this.alerts.error('Une erreur est survenue lors de l\'enregistrement.');
    }
  }
}
