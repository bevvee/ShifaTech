import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Speciality } from '../../core/models/speciality.model';
import { SpecialityService } from '../../core/services/speciality.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-specialisations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    ModalComponent,
    InputFieldComponent,
    LabelComponent,
  ],
  templateUrl: './specialisations.component.html',
  styles: ``
})
export class SpecialisationsComponent {

  specialisations: Speciality[] = [];
  searchTerm = '';

  private readonly subscription = new Subscription();
  private readonly specialityService = inject(SpecialityService);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);

  isModalOpen = false;
  mode: 'create' | 'edit' = 'create';
  submitted = false;
  editingId: number | null = null;

  form: {
    label: string;
  } = this.emptyForm();

  ngOnInit() {
    this.loadSpecialities();
    this.handleUrl(this.router.url);
    this.subscription.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => this.handleUrl(this.router.url)),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadSpecialities() {
    this.specialityService.getSpecialities().subscribe({
      next: (data) => this.specialisations = data,
      error: (err: any) => console.error('Error loading specialities', err)
    });
  }

  get filteredSpecialities(): Speciality[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.specialisations;
    return this.specialisations.filter(s => s.label.toLowerCase().includes(q));
  }

  goToCreate() {
    this.router.navigate(['/specialisations/new']);
  }

  openCreateModal() {
    this.mode = 'create';
    this.editingId = null;
    this.submitted = false;
    this.form = this.emptyForm();
    this.isModalOpen = true;
  }

  openEditModal(row: Speciality) {
    this.mode = 'edit';
    this.editingId = row.idSpecialite;
    this.submitted = false;
    this.form = {
      label: row.label,
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.router.url === '/specialisations/new') {
      this.router.navigate(['/specialisations']);
    }
  }

  deleteSpeciality(id: number) {
    void this.confirmAndDeleteSpeciality(id);
  }

  private async confirmAndDeleteSpeciality(id: number) {
    const ok = await this.alerts.confirmDelete('cette spécialité');
    if (!ok) return;

    this.specialityService.deleteSpeciality(id).subscribe({
      next: () => this.loadSpecialities(),
      error: (err: any) => console.error('Error deleting speciality', err)
    });
  }

  get isValid(): boolean {
    return !!this.form.label && this.form.label.trim().length > 0;
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const payload: Partial<Speciality> = {
      label: this.form.label.trim(),
    };

    if (this.mode === 'create') {
      this.specialityService.createSpeciality(payload).subscribe({
        next: () => {
          this.loadSpecialities();
          this.closeModal();
        },
        error: (err: any) => console.error('Error creating speciality', err)
      });
      return;
    }

    const id = this.editingId;
    if (id == null) return;
    this.specialityService.updateSpeciality(id, payload).subscribe({
      next: () => {
        this.loadSpecialities();
        this.closeModal();
      },
      error: (err: any) => console.error('Error updating speciality', err)
    });
  }

  private emptyForm() {
    return {
      label: '',
    };
  }

  private handleUrl(url: string) {
    if (url === '/specialisations/new') {
      this.openCreateModal();
    }
  }

}
