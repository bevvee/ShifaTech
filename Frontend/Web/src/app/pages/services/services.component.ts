import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ServiceRow } from '../../core/models/service.model';
import { ServicesCatalogService } from '../../core/services/services-catalog.service';

@Component({
  selector: 'app-services',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
  ],
  templateUrl: './services.component.html',
  styles: ``
})
export class ServicesComponent {

  services: ServiceRow[] = [];

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private readonly router: Router,
    private readonly alerts: AlertService,
    private readonly servicesCatalog: ServicesCatalogService,
  ) {}

  ngOnInit() {
    this.reload();
  }

  private reload() {
    this.services = this.servicesCatalog.getAll();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
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

    const updated = this.services.filter((s) => s.id !== id);
    this.services = updated;
    this.servicesCatalog.saveAll(updated);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
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
