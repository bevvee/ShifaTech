import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ListCardComponent } from '../../shared/components/common/list-card/list-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ServiceRow } from '../../core/models/service.model';
import { AdminServicesService } from '../../core/services/admin-services.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-services',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ListCardComponent,
    ButtonComponent,
  ],
  templateUrl: './services.component.html',
  styles: ``
})
export class ServicesComponent implements OnInit {

  services: ServiceRow[] = [];
  loading = false;
  error: string | null = null;

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private readonly router: Router,
    private readonly alerts: AlertService,
    private readonly adminServices: AdminServicesService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  private loadServices() {
    this.loading = true;
    this.error = null;
    this.adminServices.getAllServices().subscribe({
      next: (data) => {
        this.services = data || [];
        this.loading = false;
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.error = 'Erreur lors du chargement des services';
        this.loading = false;
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/services/new']);
  }

  goToView(row: ServiceRow) {
    this.router.navigate(['/services', row.id]);
  }

  goToEdit(row: ServiceRow) {
    this.router.navigate(['/services', row.id, 'edit']);
  }

  deleteService(id: number) {
    void this.confirmAndDeleteService(id);
  }

  private async confirmAndDeleteService(id: number) {
    const ok = await this.alerts.confirmDelete('ce service');
    if (!ok) return;

    this.adminServices.deleteService(id).subscribe({
      next: () => {
        this.toastService.success('Succès', 'Service supprimé avec succès.');
        this.loadServices();
      },
      error: (err) => {
        console.error('Error deleting service:', err);
        this.toastService.error('Erreur', 'Erreur lors de la suppression du service');
      }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.services.length / this.itemsPerPage));
  }

  get currentServicesItems(): ServiceRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.services.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
