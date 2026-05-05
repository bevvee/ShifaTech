import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { SecretaireService } from '../../core/services/secretaire.service';
import { ToastService } from '../../shared/services/toast.service';
import { AlertService } from '../../core/services/alert.service';
import { Sexe } from '../../core/models/secretaire.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-secretaires-form-page',
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
    TextAreaComponent,
  ],
  templateUrl: './secretaires-form-page.component.html',
  styles: ``
})
export class SecretairesFormPageComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly secretaireService = inject(SecretaireService);
  private readonly toastService = inject(ToastService);
  private readonly alertService = inject(AlertService);

  mode: Mode = 'create';
  submitted = false;
  loading = false;
  private id: number | null = null;

  sexeOptions: Option[] = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' },
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
    password: '',
    sexe: 'M' as Sexe,
    statutValue: 'true' as 'true' | 'false',
    dateNaissance: '',
    telephone: '',
    adresse: '',
  };

  private extractErrorMessage(err: any): string {
    const body = typeof err?.error === 'string'
      ? (() => { try { return JSON.parse(err.error); } catch { return {}; } })()
      : err?.error ?? {};

    return body?.message
      || body?.detail
      || body?.['hydra:description']
      || err?.message
      || 'Une erreur est survenue.';
  }

  ngOnInit() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    if (this.mode === 'edit' && this.id != null) {
      this.secretaireService.getById(this.id).subscribe({
        next: (existing: any) => {
          this.form = {
            nom: existing.nom ?? '',
            prenom: existing.prenom ?? '',
            cin: existing.cin ?? '',
            email: existing.email ?? '',
            password: '',
            sexe: existing.sexe ?? 'M',
            statutValue: existing.statut ? 'true' : 'false',
            dateNaissance: existing.dateNaissance ?? '',
            telephone: existing.telephone ?? '',
            adresse: existing.adresse ?? '',
          };
        },
        error: (err) => {
          this.toastService.error('Erreur', this.extractErrorMessage(err));
        }
      });
    }
  }

  get title(): string {
    return this.mode === 'create' ? 'Ajouter une Secretaire' : 'Modifier une Secretaire';
  }

  get isValid(): boolean {
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
    this.router.navigate(['/secretaires']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    this.loading = true;
    const statut = this.form.statutValue === 'true';

    if (this.mode === 'create') {
      this.secretaireService.create({
        nom: this.form.nom.trim(),
        prenom: this.form.prenom.trim(),
        cin: this.form.cin.trim(),
        email: this.form.email.trim(),
        password: this.form.password.trim(),
        sexe: this.form.sexe,
        statut,
        dateNaissance: this.form.dateNaissance,
        telephone: this.form.telephone.trim(),
        adresse: this.form.adresse.trim(),
      }).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/secretaires']).then(() => {
            this.toastService.success('Succès', 'Secretaire créée avec succès.');
          });
        },
        error: (err) => {
          this.loading = false;
          this.toastService.error('Erreur', this.extractErrorMessage(err));
        }
      });
      return;
    }

    if (this.id == null) return;

    const updateDto: any = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      cin: this.form.cin.trim(),
      email: this.form.email.trim(),
      sexe: this.form.sexe,
      statut,
      dateNaissance: this.form.dateNaissance,
      telephone: this.form.telephone.trim(),
      adresse: this.form.adresse.trim(),
    };

    if (this.form.password.trim()) {
      updateDto.password = this.form.password.trim();
    }

    this.secretaireService.update(this.id, updateDto).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/secretaires']).then(() => {
          this.toastService.success('Succès', 'Secretaire modifiée avec succès.');
        });
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error('Erreur', this.extractErrorMessage(err));
      }
    });
  }
}
