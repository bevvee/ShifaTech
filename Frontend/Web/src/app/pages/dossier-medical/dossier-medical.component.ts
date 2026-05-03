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
import { Store as NgrxStore } from '@ngrx/store';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { DoctorService } from '../../core/services/doctor.service';
import { forkJoin } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';
import { Role } from '../../core/models/role.enum';

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
  private readonly doctorService = inject(DoctorService);
  private readonly authStore = inject(NgrxStore);
  
  userRole$ = this.authStore.select(selectUserRole);
  protected readonly Role = Role;

  ngOnInit(): void {
    this.loadDossiers();
  }

  /*
  loadDossiers() {
    this.dossiers = this.store.getAll();
  }
  */

  loadDossiers() {
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
    void this.confirmAndDeleteDossier(id);
  }

  private async confirmAndDeleteDossier(id: number) {
    const ok = await this.alerts.confirmDelete('ce dossier');
    if (!ok) return;

    this.store.delete(id).subscribe({
      next: () => this.loadDossiers(),
      error: (err) => {
        console.error('Erreur suppression dossier', err);
        const msg = this.extractErrorMessage(err);
        void this.alerts.error(msg || 'Erreur lors de la suppression du dossier');
      }
    });
  }

  archiveDossier(id: number) {
    void this.confirmAndArchiveDossier(id);
  }

  private async confirmAndArchiveDossier(id: number) {
    const ok = await this.alerts.confirm({
      title: 'Archivage du dossier',
      text: 'Voulez-vous vraiment archiver ce dossier médical ? Il ne sera plus modifiable.',
      confirmText: 'Archiver',
      cancelText: 'Annuler',
      icon: 'question'
    });
    if (!ok) return;

    this.store.update(id, { status: 'ARCHIVED' as any }).subscribe({
      next: () => {
        this.alerts.success('Dossier archivé avec succès');
        this.loadDossiers();
      },
      error: (err) => {
        console.error('Erreur archivage dossier', err);
        const msg = this.extractErrorMessage(err);
        this.alerts.error(msg || 'Erreur lors de l\'archivage du dossier');
      }
    });
  }

  private extractErrorMessage(err: any): string | null {
    if (err.error?.data && typeof err.error.data === 'object') {
      const errors = err.error.data;
      return Object.values(errors).join('\n');
    }
    return err.error?.message || err.message || null;
  }

  getStatusBadgeColor(status: DossierStatus): 'success' | 'warning' | 'error' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'ARCHIVED') return 'warning';
    return 'error';
  }

  getInitials(row: DossierMedicalDto): string {
    const name = row.nomPatient?.trim() ?? '';
    if (!name) return '?';
    const parts = name.split(' ');
    const first = parts[0] ? parts[0][0] : '';
    const second = parts[1] ? parts[1][0] : '';
    return `${first}${second}`.toUpperCase() || '?';
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
