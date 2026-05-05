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
import { ServiceRow } from '../../core/models/service.model';
import { AdminServicesService } from '../../core/services/admin-services.service';
import { ToastService } from '../../shared/services/toast.service';

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
export class ServicesFormPageComponent implements OnInit {
  mode: Mode;
  submitted = false;
  loading = false;
  error: string | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminServices = inject(AdminServicesService);
  private readonly toastService = inject(ToastService);

  private id: number | null;

  form = {
    label: '',
    description: '',
  };

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;
  }

  ngOnInit() {
    if (this.mode === 'edit' && this.id != null) {
      this.loading = true;
      this.adminServices.getService(this.id).subscribe({
        next: (service) => {
          this.form = {
            label: service.label,
            description: service.description || '',
          };
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading service:', err);
          this.error = 'Impossible de charger le service';
          this.loading = false;
          this.router.navigate(['/services']);
        }
      });
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

    this.loading = true;
    this.error = null;

    const payload: Omit<ServiceRow, 'id'> = {
      label: this.form.label.trim(),
      description: this.form.description.trim(),
    };

    if (this.mode === 'create') {
      this.adminServices.createService(payload).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Service créé avec succès.');
          this.router.navigate(['/services']);
        },
        error: (err) => {
          console.error('Error creating service:', err);
          this.error = 'Erreur lors de la création du service';
          this.loading = false;
          this.toastService.error('Erreur', this.error);
        }
      });
      return;
    }

    if (this.id == null) return;
    
    this.adminServices.updateService(this.id, payload).subscribe({
      next: () => {
        this.toastService.success('Succès', 'Service modifié avec succès.');
        this.router.navigate(['/services']);
      },
      error: (err) => {
        console.error('Error updating service:', err);
        this.error = 'Erreur lors de la modification du service';
        this.loading = false;
        this.toastService.error('Erreur', this.error);
      }
    });
  }
}
