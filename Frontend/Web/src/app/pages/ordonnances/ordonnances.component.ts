import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { OrdonnanceStore } from './ordonnances.store';
import { OrdonnanceDto } from '../../core/models/ordonnance.model';

@Component({
  selector: 'app-ordonnances',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './ordonnances.component.html'
})
export class OrdonnancesComponent implements OnInit {

  searchTerm = '';
  ordonnances: OrdonnanceDto[] = [];

  private readonly router = inject(Router);
  private readonly store = inject(OrdonnanceStore);

  ngOnInit(): void {
    this.loadOrdonnances();
  }

  loadOrdonnances() {
    this.ordonnances = this.store.getAll();
  }

  viewOrdonnance(id: number) {
    this.router.navigate(['/ordonnances', id]);
  }

  editOrdonnance(id: number) {
    this.router.navigate(['/ordonnances', id, 'edit']);
  }

  deleteOrdonnance(id: number) {
    this.store.delete(id);
    this.loadOrdonnances();
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
