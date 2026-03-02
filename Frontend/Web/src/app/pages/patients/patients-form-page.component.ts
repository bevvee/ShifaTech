import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { PatientsStore, PatientRow, Sexe } from './patients.store';

type Mode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-patients-form-page',
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
  templateUrl: './patients-form-page.component.html',
  styles: ``,
})
export class PatientsFormPageComponent {
  mode: Mode;
  submitted = false;

  private id: number | null;

  sexeOptions: Option[] = [
    { value: 'M', label: 'M' },
    { value: 'F', label: 'F' },
  ];

  statutOptions: Option[] = [
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ];

  form: {
    nom: string;
    prenom: string;
    cin: string;
    email: string;
    password: string;
    sexe: Sexe;
    statutValue: 'true' | 'false';
    dateNaissance: string;
    telephone: string;
    adresse: string;
  } = this.emptyForm();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: PatientsStore,
  ) {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    if (this.mode !== 'create') {
      const existing = this.id != null ? this.store.getById(this.id) : undefined;
      if (!existing) {
        this.router.navigate(['/patients']);
        return;
      }
      this.form = this.formFromRow(existing);
    }
  }

  get title(): string {
    if (this.mode === 'create') return 'Ajouter Patient';
    if (this.mode === 'view') return 'Détails Patient';
    return 'Modifier Patient';
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  get isValid(): boolean {
    if (this.isReadOnly) return true;

    return (
      this.form.nom.trim().length > 0 &&
      this.form.prenom.trim().length > 0 &&
      this.form.cin.trim().length > 0 &&
      this.form.email.trim().length > 0 &&
      this.form.telephone.trim().length > 0 &&
      this.form.dateNaissance.trim().length > 0 &&
      (this.mode === 'edit' || this.form.password.trim().length > 0)
    );
  }

  cancel() {
    this.router.navigate(['/patients']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    if (this.isReadOnly) {
      this.cancel();
      return;
    }

    const statut = this.form.statutValue === 'true';
    const patch: Omit<PatientRow, 'id' | 'idUser' | 'numDossier' | 'poids'> = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      cin: this.form.cin.trim(),
      email: this.form.email.trim(),
      role: 'PATIENT',
      sexe: this.form.sexe,
      statut,
      dateNaissance: this.form.dateNaissance,
      telephone: this.form.telephone.trim(),
      adresse: this.form.adresse.trim(),
    };

    if (this.mode === 'create') {
      this.store.create(patch);
      this.router.navigate(['/patients']);
      return;
    }

    if (this.id == null) return;
    const ok = this.store.update(this.id, patch);
    if (!ok) return;

    this.router.navigate(['/patients']);
  }

  private emptyForm() {
    return {
      nom: '',
      prenom: '',
      cin: '',
      email: '',
      password: '',
      sexe: 'M' as Sexe,
      statutValue: 'true' as const,
      dateNaissance: '',
      telephone: '',
      adresse: '',
    };
  }

  private formFromRow(row: PatientRow) {
    const statutValue = (row.statut ? 'true' : 'false') as 'true' | 'false';
    return {
      nom: row.nom,
      prenom: row.prenom,
      cin: row.cin,
      email: row.email,
      password: '',
      sexe: row.sexe,
      statutValue,
      dateNaissance: row.dateNaissance,
      telephone: row.telephone,
      adresse: row.adresse,
    };
  }
}
