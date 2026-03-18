import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { VisiteStore } from './visites.store';
import { VisiteDto } from '../../core/models/visite.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-visites',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './visites.component.html'
})
export class VisitesComponent implements OnInit {

  searchTerm = '';
  visites: VisiteDto[] = [];

  private readonly router = inject(Router);
  private readonly store = inject(VisiteStore);
  private readonly alerts = inject(AlertService);

  ngOnInit(): void {
    this.loadVisites();
  }

  loadVisites() {
    this.visites = this.store.getAll();
  }

  viewVisite(id: number) {
    this.router.navigate(['/visites', id]);
  }

  editVisite(id: number) {
    this.router.navigate(['/visites', id, 'edit']);
  }

  deleteVisite(id: number) {
    void this.confirmAndDeleteVisite(id);
  }

  private async confirmAndDeleteVisite(id: number) {
    const ok = await this.alerts.confirmDelete('cette visite');
    if (!ok) return;
    this.store.delete(id);
    this.loadVisites();
  }

  get filteredVisites(): VisiteDto[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.visites;

    return this.visites.filter((v) => {
      const haystack = [
        v.nomPatient,
        v.numDossier,
        v.status,
        v.planTraitement,
        v.observations
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }
}
