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
import { ServiceRow } from '../../core/models/service.model';
import { ServicesCatalogService } from '../../core/services/services-catalog.service';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-services-form-page',
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
  ],
  templateUrl: './services-form-page.component.html',
  styles: ``,
})
export class ServicesFormPageComponent {
  mode: Mode;
  submitted = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicesCatalog = inject(ServicesCatalogService);

  private id: number | null;

  form = {
    label: '',
    description: '',
  };

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    if (this.mode === 'edit' && this.id != null) {
      const existing = this.servicesCatalog.getAll().find((s) => s.id === this.id) ?? null;
      if (!existing) {
        this.router.navigate(['/services']);
        return;
      }
      this.form = {
        label: existing.label,
        description: existing.description,
      };
    }
  }

  get title(): string {
    return this.mode === 'create' ? 'Ajouter un service' : 'Modifier un service';
  }

  get isValid(): boolean {
    return this.form.label.trim().length > 0 && this.form.description.trim().length > 0;
  }

  cancel() {
    this.router.navigate(['/services']);
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const services = this.servicesCatalog.getAll();
    const payload: Omit<ServiceRow, 'id'> = {
      label: this.form.label.trim(),
      description: this.form.description.trim(),
    };

    if (this.mode === 'create') {
      const nextId = this.servicesCatalog.nextId(services);
      this.servicesCatalog.saveAll([{ id: nextId, ...payload }, ...services]);
      this.router.navigate(['/services']);
      return;
    }

    if (this.id == null) return;
    const updated = services.map((s) => (s.id === this.id ? { id: this.id as number, ...payload } : s));
    this.servicesCatalog.saveAll(updated);
    this.router.navigate(['/services']);
  }
}
