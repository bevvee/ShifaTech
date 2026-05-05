import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ListCardComponent } from '../../shared/components/common/list-card/list-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { Option } from '../../shared/components/form/select/select.component';
import { SecretaireService } from '../../core/services/secretaire.service';
import { SecretaireDto } from '../../core/models/secretaire.model';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-secretaires',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ListCardComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './secretaires.component.html',
  styles: ``
})
export class SecretairesComponent implements OnInit, OnDestroy {

  private readonly router = inject(Router);
  private readonly secretaireService = inject(SecretaireService);
  private readonly alertService = inject(AlertService);

  secretaires: SecretaireDto[] = [];
  loading = true;
  private readonly subscription = new Subscription();

  currentPage = 1;
  itemsPerPage = 5;

  // Recherche & Filtres
  searchTerm = '';
  selectedSexe = '';

  showFilters = false;

  ngOnInit() {
    this.loadSecretaires();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadSecretaires() {
    this.loading = true;
    this.secretaireService.getAll().subscribe({
      next: (res: any) => {
        let items: any[] = [];

        if (Array.isArray(res)) {
          items = res;
        } else if (res['data']) {
          items = res['data'];
        } else if (res['member']) {
          items = res['member'];
        } else if (res['hydra:member']) {
          items = res['hydra:member'];
        }

        this.secretaires = items.map((sec: any) => ({
          ...sec,
          id: sec.id ?? (sec['@id'] ? parseInt(sec['@id'].split('/').pop(), 10) : sec.id_utilisateur)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/secretaires/new']);
  }

  openEditModal(row: any) {
    this.router.navigate(['/secretaires', row.id, 'edit']);
  }

  async deleteSecretaire(id: number) {
    const confirmed = await this.alertService.confirmDelete('cette secretaire');
    if (!confirmed) return;
    
    this.secretaireService.deleteById(id).subscribe({
      next: () => {
        this.secretaires = this.secretaires.filter(s => s.id !== id);
      },
      error: () => alert('Erreur suppression')
    });
  }

  get filteredSecretaires(): SecretaireDto[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.secretaires.filter(sec => {
      // Recherche texte
      const matchSearch = !q || [
        sec.nom,
        sec.prenom,
        sec.cin,
        sec.email,
        sec.telephone,
        sec.adresse,
      ].filter(Boolean).join(' ').toLowerCase().includes(q);

      // Filtre sexe
      const matchSexe = !this.selectedSexe || sec.sexe === this.selectedSexe;

      return matchSearch && matchSexe;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSecretaires.length / this.itemsPerPage));
  }

  get currentSecretairesItems(): SecretaireDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSecretaires.slice(start, start + this.itemsPerPage);
  }

  onSearch() {
    this.currentPage = 1;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedSexe = '';
    this.currentPage = 1;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  get hasActiveFilters(): boolean {
    return !!this.selectedSexe;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToView(row: any) {
    this.router.navigate(['/secretaires', row.id]);
  }

  goToEdit(row: any) {
    this.router.navigate(['/secretaires', row.id, 'edit']);
  }
}
