import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { OrdonnanceStore } from './ordonnances.store';
import { OrdonnanceDto, OrdonnanceStatut } from '../../core/models/ordonnance.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-ordonnances',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BadgeComponent,
  ],
  templateUrl: './ordonnances.component.html'
})
export class OrdonnancesComponent implements OnInit {

  searchTerm = '';
  ordonnances: OrdonnanceDto[] = [];

  private readonly router = inject(Router);
  private readonly store = inject(OrdonnanceStore);
  private readonly alerts = inject(AlertService);

  ngOnInit(): void {
    this.loadOrdonnances();
  }

  /*
  loadOrdonnances() {
    this.ordonnances = this.store.getAll();
  }
  */

  loadOrdonnances() {
    this.store.getAll().subscribe({
      next: (data) => this.ordonnances = data,
      error: (err) => console.error('Erreur chargement ordonnances', err)
    });
  }

  createOrdonnance() {
    this.router.navigate(['/ordonnances/new']);
  }

  viewOrdonnance(id: number) {
    this.router.navigate(['/ordonnances', id]);
  }

  editOrdonnance(id: number) {
    this.router.navigate(['/ordonnances', id, 'edit']);
  }

  /*
  deleteOrdonnance(id: number) {
    void this.confirmAndDeleteOrdonnance(id);
  }

  private async confirmAndDeleteOrdonnance(id: number) {
    const ok = await this.alerts.confirmDelete('cette ordonnance');
    if (!ok) return;
    this.store.delete(id);
    this.loadOrdonnances();
  }
  */

  /*
  deleteOrdonnance(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      // Note: delete n'est pas encore async mais on anticipe
      this.store.delete(id);
      this.loadOrdonnances();
    }
  }
  */

  deleteOrdonnance(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      this.store.delete(id).subscribe(() => {
        this.loadOrdonnances();
      });
    }
  }

  getStatusBadgeColor(status: OrdonnanceStatut): 'success' | 'warning' | 'error' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'EXPIRED') return 'warning';
    return 'error';
  }

  get filteredOrdonnances(): OrdonnanceDto[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.ordonnances;

    return this.ordonnances.filter((o) => {
      const haystack = [
        o.nomPatient,
        o.numDossier,
        o.description,
        o.medicaments,
        o.statut
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }
}
