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
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { Role } from '../../core/models/role.enum';

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
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  private id: number | null;
  private idUser: number | null = null;

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
    passwordConfirmation: string;
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
          this.idUser = existing?.idUser ?? null;
          this.form = {
            nom: existing?.nom ?? '',
            prenom: existing?.prenom ?? '',
            cin: existing?.cin ?? '',
            email: existing?.email ?? '',
            password: '',
            passwordConfirmation: '',
            sexe:
              existing?.sexe === 'F' || existing?.sexe === 'f' || existing?.sexe === Sexe.F
                ? Sexe.F
                : Sexe.H,
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
    const passwordValid = this.mode === 'edit' && !this.form.password?.trim()
      ? true 
      : (!!this.form.password?.trim() && this.form.password === this.form.passwordConfirmation);

    return (
      !!this.form.nom?.trim() &&
      !!this.form.prenom?.trim() &&
      !!this.form.cin?.trim() &&
      !!this.form.email?.trim() &&
      !!this.form.telephone?.trim() &&
      !!this.form.dateNaissance?.trim() &&
      !!this.form.numeroOrdre?.trim() &&
      !!this.form.idSpecialite &&
      passwordValid
    );
  }

  cancel() {
    this.router.navigate(['/docteurs']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const statut = this.form.statutValue === 'true';
    
    // Auth-service user data (create)
    const authPayload: any = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      cin: this.form.cin.trim(),
      email: this.form.email.trim(),
      password: this.form.password.trim(),
      role: Role.DOCTEUR,
      sexe: this.form.sexe === Sexe.H ? 'M' : 'F',
      statut,
      telephone: this.form.telephone.trim(),
      adresse: this.form.adresse.trim(),
      dateNaissance: this.form.dateNaissance,
      passwordConfirmation: this.form.passwordConfirmation.trim(),
    };

    // Auth-service user data (update) — backend DTO uses `motDePasse` not `password`
    const authUpdatePayload: any = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      email: this.form.email.trim(),
      role: Role.DOCTEUR,
      sexe: this.form.sexe === Sexe.H ? 'M' : 'F',
      statut,
      telephone: this.form.telephone.trim(),
      adresse: this.form.adresse.trim(),
      dateNaissance: this.form.dateNaissance,
      ...(this.form.password?.trim() ? { motDePasse: this.form.password.trim() } : {}),
    };

    if (this.mode === 'create') {
      this.authService.register(authPayload).subscribe({
        next: (authRes: any) => {
          if (authRes?.error) {
             this.toastService.error('Erreur', authRes.message || 'Erreur lors de la création de l\'utilisateur.');
             return;
          }
          
          const newUserId = authRes?.user?.idUser;
          if (!newUserId) {
             this.toastService.error('Erreur', 'Impossible de récupérer l\'ID utilisateur créé.');
             return;
          }

          const docPayload: Omit<Doctor, 'idDocteur'> = {
            idUser: newUserId,
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

          this.doctorService.createDoctor(docPayload).subscribe({
            next: () => {
               this.toastService.success('Succès', 'Docteur ajouté avec succès.');
               this.router.navigate(['/docteurs']);
            },
            error: (err: any) => this.toastService.error('Erreur', err?.error?.message || 'Erreur lors de la création du profil docteur.'),
          });
        },
        error: (err: any) => this.toastService.error('Erreur API', err?.error?.message || 'Connexion auth-service échouée.')
      });
      return;
    }

    if (this.id == null) return;

    const docPayload: Omit<Doctor, 'idDocteur'> = {
      idUser: this.idUser || 0,
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

    const updateDoctorProfile = () => {
      this.doctorService.updateDoctor(this.id!, docPayload).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Docteur mis à jour avec succès');
          this.router.navigate(['/docteurs']);
        },
        error: (err: any) => this.toastService.error('Erreur', 'Erreur lors de la mise à jour du docteur.')
      });
    };

    if (this.idUser) {
      this.authService.updateUser(this.idUser, authUpdatePayload).subscribe({
        next: (res: any) => {
          if (res?.error) {
             this.toastService.error('Erreur', res.message || 'Erreur lors de la mise à jour (Auth).');
             return;
          }
          updateDoctorProfile();
        },
        error: (err: any) => this.toastService.error('Erreur', 'Impossible de joindre auth-service pour la mise à jour.')
      });
    } else {
      updateDoctorProfile();
    }
  }

  private emptyForm() {
    return {
      nom: '',
      prenom: '',
      cin: '',
      email: '',
      password: '',
      passwordConfirmation: '',
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
