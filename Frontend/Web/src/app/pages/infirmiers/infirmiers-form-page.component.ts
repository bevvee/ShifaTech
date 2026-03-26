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
import { InfirmierService } from '../../core/services/infirmier.service';
import { ToastService } from '../../shared/services/toast.service';
import { Sexe } from '../../core/models/infirmier.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-infirmiers-form-page',
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
  templateUrl: './infirmiers-form-page.component.html',
  styles: ``
})
export class InfirmiersFormPageComponent implements OnInit {

  mode: Mode = 'create';
  submitted = false;
  loading = false;
  private id: number | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly infirmierService = inject(InfirmierService);
  private readonly toastService = inject(ToastService);

  sexeOptions: Option[] = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' },
  ];

  statutOptions: Option[] = [
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ];

  specialiteOptions: Option[] = [];

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
    idSpecialite: '',
  };

  ngOnInit() {
      this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
      const idParam = this.route.snapshot.paramMap.get('id');
      this.id = idParam ? Number(idParam) : null;

      this.loadSpecialites();

      if (this.mode === 'edit' && this.id != null) {
        this.infirmierService.getById(this.id).subscribe({
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
              idSpecialite: String(existing.id_specialite ?? ''),
            };
          },
          error: () => this.router.navigate(['/infirmiers'])
        });
      }
    }

  loadSpecialites() {
    this.infirmierService.getSpecialites().subscribe({
      next: (res: any) => {
        const list = res['member'] ?? res['hydra:member'] ?? res ?? [];
        this.specialiteOptions = list.map((s: any) => ({
          value: String(s.id),
          label: s.label
        }));
      },
      error: () => {}
    });
  }

  get title(): string {
    return this.mode === 'create' ? 'Ajouter un Infirmier' : 'Modifier un Infirmier';
  }

  get isValid(): boolean {
    return (
      this.form.nom.trim().length > 0 &&
      this.form.prenom.trim().length > 0 &&
      this.form.cin.trim().length > 0 &&
      this.form.email.trim().length > 0 &&
      this.form.telephone.trim().length > 0 &&
      this.form.dateNaissance.trim().length > 0 &&
      this.form.idSpecialite.trim().length > 0 &&
      (this.mode === 'edit' || this.form.password.trim().length > 0)
    );
  }

  cancel() {
    this.router.navigate(['/infirmiers']);
  }

  save() {
    console.log('save appelé, mode:', this.mode, 'id:', this.id);
    console.log('isValid:', this.isValid);
    this.submitted = true;
    if (!this.isValid) return;

    this.loading = true;
    const statut = this.form.statutValue === 'true';

    if (this.mode === 'create') {
      this.infirmierService.create({
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
        idSpecialite: Number(this.form.idSpecialite),
      }).subscribe({
        next: () => {
          this.loading = false;
          this.toastService.success('Succès', 'Infirmier créé avec succès.');
          this.router.navigate(['/infirmiers']);
        },
        error: () => {
          this.loading = false;
        }
      });
      return;
    }

    if (this.id == null) {
        console.log('id est null, return');
        return;
    }
    console.log('id ok, lancement update');
    
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
      id_specialite: `/api/infirmier_specialites/${this.form.idSpecialite}`,
    };
    if (this.form.password.trim()) updateDto.password = this.form.password.trim();
    console.log('avant update, id:', this.id, 'dto:', updateDto);
    this.infirmierService.update(this.id, updateDto).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Succès', 'Infirmier modifié avec succès.');
        this.router.navigate(['/infirmiers']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}