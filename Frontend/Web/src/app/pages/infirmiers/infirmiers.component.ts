import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { Option } from '../../shared/components/form/select/select.component';
import { TableDropdownComponent } from '../../shared/components/common/table-dropdown/table-dropdown.component';
import { InfirmierService } from '../../core/services/infirmier.service';
import { InfirmierDto } from '../../core/models/infirmier.model';

@Component({
  selector: 'app-infirmiers',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    BadgeComponent,
    TableDropdownComponent,
  ],
  templateUrl: './infirmiers.component.html',
  styles: ``
})
export class InfirmiersComponent implements OnInit, OnDestroy {

  infirmiers: InfirmierDto[] = [];
  specialiteOptions: Option[] = [];
  private readonly subscription = new Subscription();

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private readonly router: Router,
    private readonly infirmierService: InfirmierService
  ) {}

  ngOnInit() {
    this.loadInfirmiers();
    this.loadSpecialites();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadInfirmiers() {
    this.infirmierService.getAll().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.infirmiers = res;
        } else if (res['member']) {
          this.infirmiers = res['member'];
        } else if (res['hydra:member']) {
          this.infirmiers = res['hydra:member'];
        } else {
          this.infirmiers = [];
        }
         console.log('premier infirmier:', this.infirmiers[0]);
         console.log('statut:', this.infirmiers[0]?.statut, typeof this.infirmiers[0]?.statut);
      },
      error: (err) => console.error('Erreur:', err)
    });
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
      error: (err) => console.error('Erreur spécialités:', err)
    });
  }

  goToCreate() {
    this.router.navigate(['/infirmiers/new']);
  }

  openEditModal(row: any) {
    this.router.navigate(['/infirmiers', row.id, 'edit']);
  }

  deleteInfirmier(id: number) {
    if (!confirm('Confirmer la suppression ?')) return;
    this.infirmierService.deleteById(id).subscribe({
      next: () => {
        this.infirmiers = this.infirmiers.filter(i => i.id !== id);
      },
      error: () => alert('Erreur suppression')
    });
  }

  getSpecialiteLabel(id: number): string {
    const found = this.specialiteOptions.find(s => s.value === String(id));
    return found ? found.label : '-';
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.infirmiers.length / this.itemsPerPage));
  }

  get currentInfirmiersItems(): InfirmierDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.infirmiers.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}