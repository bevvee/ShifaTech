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

  loadOrdonnances() {
    this.ordonnances = this.store.getAll();
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

  deleteOrdonnance(id: number) {
    void this.confirmAndDeleteOrdonnance(id);
  }

  private async confirmAndDeleteOrdonnance(id: number) {
    const ok = await this.alerts.confirmDelete('cette ordonnance');
    if (!ok) return;
    this.store.delete(id);
    this.loadOrdonnances();
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
