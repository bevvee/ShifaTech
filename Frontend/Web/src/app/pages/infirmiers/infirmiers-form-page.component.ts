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
import { InfirmierRow, Sexe } from '../../core/models/infirmier.model';
import { InfirmiersCatalogService } from '../../core/services/infirmiers-catalog.service';

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
  styles: ``,
})
export class InfirmiersFormPageComponent {
  mode: Mode;
  submitted = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly infirmiersCatalog = inject(InfirmiersCatalogService);

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

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    if (this.mode === 'edit' && this.id != null) {
      const existing = this.infirmiersCatalog.getById(this.id);
      if (!existing) {
        this.router.navigate(['/infirmiers']);
        return;
      }

      this.form = {
        nom: existing.nom,
        prenom: existing.prenom,
        cin: existing.cin,
        email: existing.email,
        password: '',
        sexe: existing.sexe,
        statutValue: existing.statut ? 'true' : 'false',
        dateNaissance: existing.dateNaissance,
        telephone: existing.telephone,
        adresse: existing.adresse,
      };
    }
  }

  get title(): string {
    return this.mode === 'create' ? 'Ajouter un infirmier' : 'Modifier un infirmier';
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
    this.router.navigate(['/infirmiers']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const items = this.infirmiersCatalog.getAll();

    const statut = this.form.statutValue === 'true';

    const payloadBase: Omit<InfirmierRow, 'id' | 'idService' | 'idSpecialite'> = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      cin: this.form.cin.trim(),
      email: this.form.email.trim(),
      role: 'INFIRMIER',
      sexe: this.form.sexe,
      statut,
      dateNaissance: this.form.dateNaissance,
      telephone: this.form.telephone.trim(),
      adresse: this.form.adresse.trim(),
    };

    if (this.mode === 'create') {
      const nextId = this.infirmiersCatalog.nextId(items);
      const payload: InfirmierRow = {
        id: nextId,
        ...payloadBase,
        idService: 1,
        idSpecialite: 1,
      };
      this.infirmiersCatalog.saveAll([payload, ...items]);
      this.router.navigate(['/infirmiers']);
      return;
    }

    if (this.id == null) return;

    const updated = items.map((i) =>
      i.id === this.id
        ? {
            ...i,
            ...payloadBase,
          }
        : i,
    );
    this.infirmiersCatalog.saveAll(updated);
    this.router.navigate(['/infirmiers']);
  }

  private emptyForm() {
    return {
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
  }
}
