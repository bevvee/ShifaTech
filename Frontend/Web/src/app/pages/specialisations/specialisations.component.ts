import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ListCardComponent } from '../../shared/components/common/list-card/list-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { Speciality } from '../../core/models/speciality.model';
import { SpecialityOwner, SpecialityService } from '../../core/services/speciality.service';
import { AlertService } from '../../core/services/alert.service';
import { ServiceRow } from '../../core/models/service.model';
import { ServicesCatalogService } from '../../core/services/services-catalog.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { AdminServicesService } from '../../core/services/admin-services.service';

@Component({
  selector: 'app-specialisations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ListCardComponent,
    ButtonComponent,
  ],
  templateUrl: './specialisations.component.html',
  styles: ``
})
export class SpecialisationsComponent {

  owner: SpecialityOwner = 'doctor';
  private readonly adminServicesService = inject(AdminServicesService);
  createTypeValue = '';
  createOptions = [
    { value: 'doctor', label: 'Ajouter pour Docteur' },
    { value: 'infirmier', label: 'Ajouter pour Infirmier' },
  ];

  specialisations: Speciality[] = [];
  searchTerm = '';
  loading = true;

  services: ServiceRow[] = [];
  private readonly specialityService = inject(SpecialityService);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly servicesCatalog = inject(ServicesCatalogService);
  private readonly toastService = inject(ToastService);
  serviceMap = new Map<number, string>();
  ngOnInit() {
    const fromQuery = this.route.snapshot.queryParamMap.get('type');
    this.owner = fromQuery === 'infirmier' ? 'infirmier' : 'doctor';
    this.loadServices();
    this.loadSpecialities();
  }

  loadServices() {
    this.adminServicesService.getAll().subscribe({
      next: (data) => {
        this.services = data;

        this.serviceMap.clear();
        data.forEach(s => this.serviceMap.set(s.id, s.label));
      },
      error: (err) => console.error('Error loading services', err)
    });
  }
  loadSpecialities() {
    this.loading = true;
    this.specialityService.getSpecialities(this.owner).subscribe({
      next: (data) => this.specialisations = data,
      error: (err: any) => console.error('Error loading specialities', err),
      complete: () => this.loading = false,
    });
  }

  setOwner(owner: SpecialityOwner) {
    if (this.owner === owner) return;
    this.owner = owner;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: owner },
      queryParamsHandling: 'merge',
    });
    this.loadSpecialities();
  }

  onCreateTypeChange(value: string) {
    this.createTypeValue = value;
    if (!value) return;
    const owner = value === 'infirmier' ? 'infirmier' : 'doctor';
    this.router.navigate(['/specialisations/new'], { queryParams: { type: owner } });
    this.createTypeValue = '';
  }


  getServiceLabel(id: number | null | undefined): string {
    if (!id) return '';
    return this.serviceMap.get(id) ?? `#${id}`;
  }

  get filteredSpecialities(): Speciality[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.specialisations;
    return this.specialisations.filter(s => s.label.toLowerCase().includes(q));
  }

  goToCreate() {
    this.router.navigate(['/specialisations/new'], { queryParams: { type: this.owner } });
  }

  goToView(row: Speciality) {
    this.router.navigate(['/specialisations', row.idSpecialite], { queryParams: { type: this.owner } });
  }

  goToEdit(row: Speciality) {
    this.router.navigate(['/specialisations', row.idSpecialite, 'edit'], { queryParams: { type: this.owner } });
  }

  deleteSpeciality(id: number) {
    void this.confirmAndDeleteSpeciality(id);
  }

  private async confirmAndDeleteSpeciality(id: number) {
    const ok = await this.alerts.confirmDelete('cette spécialité');
    if (!ok) return;

    this.specialityService.deleteSpeciality(id, this.owner).subscribe({
      next: () => {
        this.toastService.success('Succès', 'Spécialité supprimée avec succès.');
        this.loadSpecialities();
      },
      error: (err: any) => {
        this.toastService.error('Erreur', 'Erreur lors de la suppression de la spécialité.');
        console.error('Error deleting speciality', err);
      }
    });
  }

}
