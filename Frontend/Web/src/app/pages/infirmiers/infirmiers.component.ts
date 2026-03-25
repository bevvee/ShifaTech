import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { InfirmierService } from '../../core/services/infirmier.service';
import { InfirmierDto } from '../../core/models/infirmier.model';

@Component({
  selector: 'app-infirmiers',
  standalone: true,
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
export class InfirmiersComponent implements OnInit {

  infirmiers: InfirmierDto[] = [];
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private readonly router: Router,
    private readonly infirmierService: InfirmierService,
  ) {}

  ngOnInit() {
    this.loadInfirmiers();
  }

  loadInfirmiers() {
    this.infirmierService.getAll().subscribe({
      next: (res: any) => {
        this.infirmiers = res['member'] ?? res['hydra:member'] ?? (Array.isArray(res) ? res : []);
      },
      error: (err) => console.error('Erreur:', err)
    });
  }
  goToCreate() {
    this.router.navigate(['/infirmiers/new']);
  }

  goToEdit(row: InfirmierDto) {
    this.router.navigate(['/infirmiers', row.id, 'edit']);
  }

  goToView(row: InfirmierDto) {
    this.router.navigate(['/infirmiers', row.id]);
  }
  
  deleteInfirmier(id: number) {
    if (!confirm('Confirmer la suppression ?')) return;
    this.infirmierService.deleteById(id).subscribe({
      next: () => {
        this.infirmiers = this.infirmiers.filter(i => i.id !== id);
      },
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  get filteredInfirmiers(): InfirmierDto[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.infirmiers;
    return this.infirmiers.filter(inf => {
      const haystack = [inf.nom, inf.prenom, inf.cin, inf.email, inf.telephone, inf.adresse]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredInfirmiers.length / this.itemsPerPage));
  }

  get currentInfirmiersItems(): InfirmierDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredInfirmiers.slice(start, start + this.itemsPerPage);
  }

  onSearch() {
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}