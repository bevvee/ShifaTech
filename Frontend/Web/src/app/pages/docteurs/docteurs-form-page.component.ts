import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { DoctorService } from '../../core/services/doctor.service';
import { SpecialityService } from '../../core/services/speciality.service';
import { Doctor } from '../../core/models/doctor.model';
import { Sexe } from '../../core/models/sexe.enum';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-docteurs-form-page',
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
  templateUrl: './docteurs-form-page.component.html',
  styles: ``,
})
export class DocteursFormPageComponent {
  mode: Mode;
  submitted = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly doctorService = inject(DoctorService);
  private readonly specialityService = inject(SpecialityService);

  private id: number | null;

  sexeOptions: Option[] = [
    { value: Sexe.H, label: 'Masculin' },
    { value: Sexe.F, label: 'Féminin' },
  ];

  statutOptions: Option[] = [
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ];

  specialiteOptions: Option[] = [];

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
    numeroOrdre: string;
    idSpecialite: string;
  } = this.emptyForm();

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    this.loadSpecialities();

    if (this.mode === 'edit' && this.id != null) {
      this.doctorService.getDoctor(this.id).subscribe({
        next: (existing: any) => {
          this.form = {
            nom: existing?.nom ?? '',
            prenom: existing?.prenom ?? '',
            cin: existing?.cin ?? '',
            email: existing?.email ?? '',
            password: '',
            sexe: existing?.sexe === ('M' as any) ? Sexe.H : (existing?.sexe ?? Sexe.H),
            statutValue: existing?.statut ? 'true' : 'false',
            dateNaissance: existing?.dateNaissance ?? '',
            telephone: existing?.telephone ?? '',
            adresse: existing?.adresse ?? '',
            numeroOrdre: existing?.numeroOrdre ?? '',
            idSpecialite: existing?.idSpecialite != null ? String(existing.idSpecialite) : '',
          };
        },
        error: () => this.router.navigate(['/docteurs']),
      });
    }
  }

  private loadSpecialities() {
    this.specialityService.getSpecialities().subscribe({
      next: (data) => {
        this.specialiteOptions = data.map((s) => ({
          value: String(s.idSpecialite),
          label: `${s.idSpecialite} - ${s.label}`,
        }));
      },
      error: (err: any) => console.error('Error loading specialities', err),
    });
  }

  get title(): string {
    return this.mode === 'create' ? 'Ajouter un docteur' : 'Modifier un docteur';
  }

  get isValid(): boolean {
    return (
      !!this.form.nom?.trim() &&
      !!this.form.prenom?.trim() &&
      !!this.form.cin?.trim() &&
      !!this.form.email?.trim() &&
      !!this.form.telephone?.trim() &&
      !!this.form.dateNaissance?.trim() &&
      !!this.form.numeroOrdre?.trim() &&
      !!this.form.idSpecialite &&
      (this.mode === 'edit' || (!!this.form.password && this.form.password.trim().length > 0))
    );
  }

  cancel() {
    this.router.navigate(['/docteurs']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const statut = this.form.statutValue === 'true';
    const payload: Omit<Doctor, 'idDocteur'> = {
      idUser: 1, // Placeholder, should be handled by auth
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      cin: this.form.cin.trim(),
      email: this.form.email.trim(),
      statut,
      dateNaissance: this.form.dateNaissance,
      telephone: this.form.telephone.trim(),
      adresse: this.form.adresse.trim(),
      numeroOrdre: this.form.numeroOrdre.trim(),
      idSpecialite: Number(this.form.idSpecialite),
      specialiteLabel: '',
      sexe: (this.form.sexe === Sexe.H ? 'M' : this.form.sexe) as any,
    };

    if (this.mode === 'create') {
      this.doctorService.createDoctor({ ...payload, password: this.form.password.trim() }).subscribe({
        next: () => this.router.navigate(['/docteurs']),
        error: (err: any) => console.error('Error creating doctor', err),
      });
      return;
    }

    if (this.id == null) return;

    this.doctorService.updateDoctor(this.id, payload).subscribe({
      next: () => this.router.navigate(['/docteurs']),
      error: (err: any) => console.error('Error updating doctor', err),
    });
  }

  private emptyForm() {
    return {
      nom: '',
      prenom: '',
      cin: '',
      email: '',
      password: '',
      sexe: Sexe.H,
      statutValue: 'true' as 'true' | 'false',
      dateNaissance: '',
      telephone: '',
      adresse: '',
      numeroOrdre: '',
      idSpecialite: '',
    };
  }
}
