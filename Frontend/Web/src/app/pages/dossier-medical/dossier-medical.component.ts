import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { DossierMedicalStore } from './dossier-medical.store';
import { DossierMedicalDto } from '../../core/models/dossier-medical.model';

@Component({
  selector: 'app-dossier-medical',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './dossier-medical.component.html'
})
export class DossierMedicalComponent implements OnInit {

  searchTerm = '';
  dossiers: DossierMedicalDto[] = [];

  private readonly router = inject(Router);
  private readonly store = inject(DossierMedicalStore);

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers() {
    this.dossiers = this.store.getAll();
  }

  viewDossier(id: number) {
    this.router.navigate(['/dossier-medical', id]);
  }

  editDossier(id: number) {
    this.router.navigate(['/dossier-medical', id, 'edit']);
  }

  deleteDossier(id: number) {
    this.store.delete(id);
    this.loadDossiers();
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
