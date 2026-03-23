import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { PatientApiService } from '../../core/services/api/patient-api.service';
import {
  AssuranceType,
  PatientCreateDto,
  Sexe,
} from '../../core/models/patient.model';
import { catchError, of, switchMap } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';

type Mode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-patients-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    InputFieldComponent,
    LabelComponent,
    SelectComponent,
  ],
  templateUrl: './patients-form-page.component.html',
  styles: ``,
})
export class PatientsFormPageComponent {
  mode: Mode;
  submitted = false;
  loading = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly patientApi = inject(PatientApiService);
  private readonly alerts = inject(AlertService);

  private id: number | null;

  sexeOptions: Option[] = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' },
  ];

  assuranceOptions: Option[] = [
    { value: 'CNSS', label: 'CNSS' },
    { value: 'CNOPS', label: 'CNOPS' },
    { value: 'RAMED', label: 'RAMED' },
    { value: 'FAR', label: 'FAR' },
    { value: 'Privée', label: 'Privée' },
    { value: 'Aucune', label: 'Aucune' },
  ];

  statutOptions: Option[] = [
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ];

  form = {
    nom: '',
    prenom: '',
    cin: '',
    email: '',
    sexe: 'M' as Sexe,
    dateNaissance: '',
    telephone: '',
    adresse: '',
    assurance: 'CNSS' as AssuranceType,
    numeroAssurance: '',
    statutValue: 'true' as 'true' | 'false',
  };

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    if (this.mode !== 'create' && this.id != null) {
      this.patientApi.getById(this.id).subscribe({
        next: (existing) => {
          this.form = {
            nom: existing.nom,
            prenom: existing.prenom,
            cin: existing.cin,
            email: existing.email,
            sexe: existing.sexe,
            dateNaissance: existing.dateNaissance,
            telephone: existing.telephone,
            adresse: existing.adresse,
            assurance: existing.assurance,
            numeroAssurance: existing.numeroAssurance,
            statutValue: existing.statut ? 'true' : 'false',
          };
        },
        error: () => this.router.navigate(['/patients'])
      });
    }
  }

  get title(): string {
    if (this.mode === 'create') return 'Nouveau Patient';
    if (this.mode === 'view') return 'Détails du Patient';
    return 'Modifier le Patient';
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
      this.form.numeroAssurance.trim().length > 0
    );
  }

  cancel() {
    this.router.navigate(['/patients']);
  }

  save() {
    this.submitted = true;
    if (!this.form.nom || !this.form.prenom || !this.form.cin) return;

    if (this.isReadOnly) {
      this.cancel();
      return;
    }

    const payload: PatientCreateDto = {
      nom: this.form.nom,
      prenom: this.form.prenom,
      cin: this.form.cin,
      email: this.form.email,
      sexe: this.form.sexe,
      dateNaissance: this.form.dateNaissance,
      telephone: this.form.telephone,
      adresse: this.form.adresse,
      assurance: this.form.assurance,
      numeroAssurance: this.form.numeroAssurance,
      statut: this.form.statutValue === 'true',
    };

    this.loading = true;

    if (this.mode === 'create') {
      // 1. Register User in Auth Service
      const registerData = {
        nom: this.form.nom,
        prenom: this.form.prenom,
        cin: this.form.cin,
        email: this.form.email,
        password: 'ShifaTech2026',
        passwordConfirmation: 'ShifaTech2026',
        role: 'PATIENT',
        sexe: this.form.sexe,
        dateNaissance: this.form.dateNaissance,
        telephone: this.form.telephone,
        adresse: this.form.adresse
      };

      this.authService.register(registerData).pipe(
        switchMap((authRes: any) => {
          if (authRes.error) {
            throw new Error(authRes.message || 'Erreur lors de la création du compte');
          }
          
          const idUser = authRes.user?.idUser;
          if (!idUser) {
            throw new Error('ID Utilisateur non reçu après inscription');
          }
          
          // 2. Create Patient in Patient Service
          return this.patientApi.create({ ...payload, idUser } as any);
        }),
        catchError(err => {
          console.error('[PATIENT FORM] Erreur:', err);
          void this.alerts.error('Une erreur est survenue : ' + (err.message || 'Erreur inconnue'));
          this.loading = false;
          return of(null);
        })
      ).subscribe(res => {
        this.loading = false;
        if (res) {
          this.toastService.success('Succès', 'Patient créé avec succès');
          this.router.navigate(['/patients']);
        }
      });

    } else if (this.id != null) {
      this.patientApi.update(this.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.toastService.success('Succès', 'Patient mis à jour avec succès');
          this.router.navigate(['/patients']);
        },
        error: (err) => {
          console.error(err);
          void this.alerts.error('Erreur lors de la modification');
          this.loading = false;
        }
      });
    }
  }
}
