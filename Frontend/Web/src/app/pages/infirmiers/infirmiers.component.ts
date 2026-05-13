import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ListCardComponent } from '../../shared/components/common/list-card/list-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { Option } from '../../shared/components/form/select/select.component';
import { InfirmierService } from '../../core/services/infirmier.service';
import { InfirmierDto } from '../../core/models/infirmier.model';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-infirmiers',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ListCardComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './infirmiers.component.html',
  styles: ``
})
export class InfirmiersComponent implements OnInit, OnDestroy {

  infirmiers: InfirmierDto[] = [];
  specialiteOptions: Option[] = [];
  loading = true;
  private readonly subscription = new Subscription();

  currentPage = 1;
  itemsPerPage = 5;

  // Recherche & Filtres
  searchTerm = '';
  selectedSexe = '';
  selectedSpecialite = '';

  showFilters = false;

  constructor(
    private readonly router: Router,
    private readonly infirmierService: InfirmierService,
    private readonly alertService : AlertService
  ) {}

  ngOnInit() {
    this.loadInfirmiers();
    this.loadSpecialites();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadInfirmiers() {
    this.loading = true;
    this.infirmierService.getAll().subscribe({
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

        this.infirmiers = items.map((inf: any) => ({
          ...inf,
          id: inf.id ?? (inf['@id'] ? parseInt(inf['@id'].split('/').pop(), 10) : inf.id_utilisateur)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  loadSpecialites() {
    this.loading = true;
    this.infirmierService.getSpecialites().subscribe({
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

        this.specialiteOptions = items.map((s: any) => {
          const sId = s.id ? String(s.id) : (s['@id'] ? s['@id'].split('/').pop() : '');
          return {
            value: sId,
            label: s.label ?? s.nom ?? s.libelle
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur spécialités:', err);
        this.loading = false;
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/infirmiers/new']);
  }

  openEditModal(row: any) {
    this.router.navigate(['/infirmiers', row.id, 'edit']);
  }

  async deleteInfirmier(id: number) {
    const confirmed = await this.alertService.confirmDelete('cet infirmier');
    if (!confirmed) return;
    
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

  get filteredInfirmiers(): InfirmierDto[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.infirmiers.filter(inf => {
      // Recherche texte
      const matchSearch = !q || [
        inf.nom,
        inf.prenom,
        inf.cin,
        inf.email,
        inf.telephone,
        inf.adresse,
      ].filter(Boolean).join(' ').toLowerCase().includes(q);

      // Filtre sexe
      const matchSexe = !this.selectedSexe || inf.sexe === this.selectedSexe;

      // Filtre spécialité
      const matchSpecialite = !this.selectedSpecialite ||
        String(inf.id_specialite) === this.selectedSpecialite;

      return matchSearch && matchSexe && matchSpecialite;
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

  onFilterChange() {
    this.currentPage = 1;
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedSexe = '';
    this.selectedSpecialite = '';
    this.currentPage = 1;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  get hasActiveFilters(): boolean {
    return !!this.selectedSexe || !!this.selectedSpecialite;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  goToEdit(row: any) {
    this.router.navigate(['/infirmiers', row.id, 'edit']);
  }

  goToView(row: any) {
    this.router.navigate(['/infirmiers', row.id]);
  }
}