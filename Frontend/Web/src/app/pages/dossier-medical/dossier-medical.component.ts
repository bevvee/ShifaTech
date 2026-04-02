import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { DossierMedicalStore } from './dossier-medical.store';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { DossierMedicalDto, DossierStatus } from '../../core/models/dossier-medical.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-dossier-medical',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BadgeComponent,
  ],
  templateUrl: './dossier-medical.component.html'
})
export class DossierMedicalComponent implements OnInit {

  searchTerm = '';
  dossiers: DossierMedicalDto[] = [];

  private readonly router = inject(Router);
  private readonly store = inject(DossierMedicalStore);
  private readonly alerts = inject(AlertService);

  ngOnInit(): void {
    this.loadDossiers();
  }

  /*
  loadDossiers() {
    this.dossiers = this.store.getAll();
  }
  */

  loadDossiers() {
    this.store.getAll().subscribe({
      next: (data) => this.dossiers = data,
      error: (err) => console.error('Erreur chargement dossiers', err)
    });
  }

  createDossier() {
    this.router.navigate(['/dossier-medical/new']);
  }

  viewDossier(id: number) {
    this.router.navigate(['/dossier-medical', id]);
  }

  editDossier(id: number) {
    this.router.navigate(['/dossier-medical', id, 'edit']);
  }

  /*
  deleteDossier(id: number) {
    void this.confirmAndDeleteDossier(id);
  }

  private async confirmAndDeleteDossier(id: number) {
    const ok = await this.alerts.confirmDelete('ce dossier');
    if (!ok) return;
    this.store.delete(id);
    this.loadDossiers();
  }
  */

  deleteDossier(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      this.store.delete(id).subscribe({
        next: () => this.loadDossiers(),
        error: (err) => console.error('Erreur suppression dossier', err)
      });
    }
  }

  getStatusBadgeColor(status: DossierStatus): 'success' | 'warning' | 'error' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'ARCHIVED') return 'warning';
    return 'error';
  }

  get filteredDossiers(): DossierMedicalDto[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.dossiers;

    return this.dossiers.filter((d) => {
      const haystack = [
        d.nomPatient,
        d.numDossier,
        d.status,
        d.groupeSanguin
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }
}
