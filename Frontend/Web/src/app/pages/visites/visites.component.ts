import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { VisiteStore } from './visites.store';
import { VisiteDto } from '../../core/models/visite.model';
import { AlertService } from '../../core/services/alert.service';
import { Store as NgrxStore } from '@ngrx/store';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { DoctorService } from '../../core/services/doctor.service';
import { DossierMedicalStore } from '../dossier-medical/dossier-medical.store';
import { forkJoin } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';
import { Role } from '../../core/models/role.enum';

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
  private readonly doctorService = inject(DoctorService);
  private readonly authStore = inject(NgrxStore);
  private readonly dossierStore = inject(DossierMedicalStore);

  ngOnInit(): void {
    this.loadVisites();
  }

  /*
  loadVisites() {
    this.visites = this.store.getAll();
  }
  */

  loadVisites() {
    this.authStore.select(selectUserRole).pipe(
      take(1),
      switchMap((role) => {
        if (role === Role.DOCTEUR) {
          return this.store.getAllForDoctor();
        } else {
          return this.store.getAll();
        }
      })
    ).subscribe({
      next: (data) => this.visites = data,
      error: (err) => console.error('Erreur chargement visites', err)
    });
  }

  viewVisite(id: number) {
    this.router.navigate(['/visites', id]);
  }

  editVisite(id: number) {
    this.router.navigate(['/visites', id, 'edit']);
  }

  /*
  deleteVisite(id: number) {
    void this.confirmAndDeleteVisite(id);
  }

  private async confirmAndDeleteVisite(id: number) {
    const ok = await this.alerts.confirmDelete('cette visite');
    if (!ok) return;
    this.store.delete(id);
    this.loadVisites();
  }
  */

  /*
  deleteVisite(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette visite ?')) {
      // Note: delete dans le store n'est pas encore async mais on anticipe
      this.store.delete(id);
      this.loadVisites();
    }
  }
  */

  deleteVisite(id: number) {
    void this.confirmAndDeleteVisite(id);
  }

  private async confirmAndDeleteVisite(id: number) {
    const ok = await this.alerts.confirmDelete('cette visite');
    if (!ok) return;

    this.store.delete(id).subscribe({
      next: () => {
        this.loadVisites();
      },
      error: (err) => console.error('Erreur suppression visite', err)
    });
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
