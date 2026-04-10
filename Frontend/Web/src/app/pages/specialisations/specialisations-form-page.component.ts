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
import { SpecialityOwner, SpecialityService } from '../../core/services/speciality.service';
import { ServicesCatalogService } from '../../core/services/services-catalog.service';
import { Speciality } from '../../core/models/speciality.model';
import { ToastService } from '../../shared/services/toast.service';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-specialisations-form-page',
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
  templateUrl: './specialisations-form-page.component.html',
  styles: ``,
})
export class SpecialisationsFormPageComponent {
  mode: Mode;
  submitted = false;

  owner: SpecialityOwner;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly specialityService = inject(SpecialityService);
  private readonly servicesCatalog = inject(ServicesCatalogService);
  private readonly toastService = inject(ToastService);

  private id: number | null;

  serviceOptions: Option[] = [];

  form = {
    label: '',
    serviceIdValue: '',
  };

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    const fromQuery = this.route.snapshot.queryParamMap.get('type');
    this.owner = fromQuery === 'infirmier' ? 'infirmier' : 'doctor';

    this.serviceOptions = this.servicesCatalog.getAll().map((s) => ({
      value: String(s.id),
      label: s.label,
    }));

    if (this.mode === 'edit' && this.id != null) {
      this.specialityService.getSpeciality(this.id, this.owner).subscribe({
        next: (existing) => {
          this.form = {
            label: existing.label,
            serviceIdValue: existing.idService != null ? String(existing.idService) : '',
          };
        },
        error: () => this.router.navigate(['/specialisations']),
      });
    }
  }

  get title(): string {
    const ownerLabel = this.owner === 'infirmier' ? 'Infirmier' : 'Docteur';
    return this.mode === 'create'
      ? `Ajouter une spécialité (${ownerLabel})`
      : `Modifier une spécialité (${ownerLabel})`;
  }

  get isValid(): boolean {
    const idService = Number(this.form.serviceIdValue);
    return this.form.label.trim().length > 0 && Number.isFinite(idService) && idService > 0;
  }

  cancel() {
    this.router.navigate(['/specialisations'], { queryParams: { type: this.owner } });
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const idService = Number(this.form.serviceIdValue);
    if (!Number.isFinite(idService) || idService <= 0) return;

    const payload: Partial<Speciality> = {
      label: this.form.label.trim(),
      idService,
    };

    const owner = this.owner;

    if (this.mode === 'create') {
      this.specialityService.createSpeciality(payload, owner).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Spécialisation ajoutée avec succès.');
          this.router.navigate(['/specialisations'], { queryParams: { type: owner } });
        },
        error: (err: any) => {
          this.toastService.error('Erreur', 'Erreur lors de l\'ajout de la spécialisation.');
          console.error('Error creating speciality', err);
        },
      });
      return;
    }

    if (this.id == null) return;

    this.specialityService.updateSpeciality(this.id, payload, owner).subscribe({
      next: () => {
        this.toastService.success('Succès', 'Spécialisation modifiée avec succès.');
        this.router.navigate(['/specialisations'], { queryParams: { type: owner } });
      },
      error: (err: any) => {
        this.toastService.error('Erreur', 'Erreur lors de la modification de la spécialisation.');
        console.error('Error updating speciality', err);
      },
    });
  }
}
