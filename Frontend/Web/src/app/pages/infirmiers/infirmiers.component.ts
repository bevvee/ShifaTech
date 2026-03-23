import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { InfirmierRow } from '../../core/models/infirmier.model';
import { InfirmiersCatalogService } from '../../core/services/infirmiers-catalog.service';

@Component({
  selector: 'app-infirmiers',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './infirmiers.component.html',
  styles: ``
})
export class InfirmiersComponent {
  infirmiers: InfirmierRow[] = [];

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private readonly router: Router,
    private readonly alerts: AlertService,
    private readonly infirmiersCatalog: InfirmiersCatalogService,
  ) {}

  ngOnInit() {
    this.reload();
  }

  private reload() {
    this.infirmiers = this.infirmiersCatalog.getAll();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  goToCreate() {
    this.router.navigate(['/infirmiers/new']);
  }

  goToView(row: InfirmierRow) {
    this.router.navigate(['/infirmiers', row.id]);
  }

  goToEdit(row: InfirmierRow) {
    this.router.navigate(['/infirmiers', row.id, 'edit']);
  }

  deleteInfirmier(id: number) {
    void this.confirmAndDeleteInfirmier(id);
  }

  private async confirmAndDeleteInfirmier(id: number) {
    const ok = await this.alerts.confirmDelete('cet infirmier');
    if (!ok) return;

    const updated = this.infirmiers.filter((i) => i.id !== id);
    this.infirmiers = updated;
    this.infirmiersCatalog.saveAll(updated);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.infirmiers.length / this.itemsPerPage));
  }

  get currentInfirmiersItems(): InfirmierRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.infirmiers.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

}
