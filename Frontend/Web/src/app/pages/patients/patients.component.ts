import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ListCardComponent } from '../../shared/components/common/list-card/list-card.component';
import { PatientsStore } from './patients.store';
import { DossierMedicalStore } from '../dossier-medical/dossier-medical.store';
import { PatientDto } from '../../core/models/patient.model';
import { AlertService } from '../../core/services/alert.service';
import { Role } from '../../core/models/role.enum';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { DoctorService } from '../../core/services/doctor.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ListCardComponent,
  ],
  templateUrl: './patients.component.html'
})
export class PatientsComponent implements OnInit {

  searchTerm = '';
  patients: PatientDto[] = [];
  loading = true;

  private readonly router = inject(Router);
  private readonly store = inject(PatientsStore);
  private readonly dossierStore = inject(DossierMedicalStore);
  private readonly alerts = inject(AlertService);
  private readonly authStore = inject(Store);
  private readonly doctorService = inject(DoctorService);
  
  userRole$ = this.authStore.select(selectUserRole);
  readonly Role = Role;

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.userRole$.pipe(take(1)).subscribe((role) => {
      if (role === Role.DOCTEUR) {
        this.doctorService.getMyPatients().subscribe({
          next: (data) => this.patients = data,
          error: (err) => console.error('Erreur chargement mes patients', err),
          complete: () => this.loading = false,
        });
      } else {
        this.store.getAll().subscribe({
          next: (data) => this.patients = data,
          error: (err) => console.error('Erreur chargement patients', err),
          complete: () => this.loading = false,
        });
      }
    });
  }

  /*
  viewDossierByPatient(patientId: number) {
    const dossier = this.dossierStore.getByPatientId(patientId);
    if (dossier) {
      this.router.navigate(['/dossier-medical', dossier.id]);
    } else {
      // If no dossier exists, navigate to create page with patient pre-selected
      this.router.navigate(['/dossier-medical/new'], { queryParams: { patientId } });
    }
  }
  */

  viewDossierByPatient(patientId: number) {
    this.dossierStore.getByPatientId(patientId).subscribe({
      next: (dossier) => {
        if (dossier) {
          this.router.navigate(['/dossier-medical', dossier.id]);
        } else {
          this.router.navigate(['/dossier-medical/new'], { queryParams: { patientId } });
        }
      },
      error: (err) => {
        console.error('Erreur récupération dossier', err);
        // En cas d'erreur (ex: 404), on propose d'en créer un
        this.router.navigate(['/dossier-medical/new'], { queryParams: { patientId } });
      }
    });
  }

  onViewDetails(patientId: number) {
    console.log('[DEBUG] Clic sur Voir Détails pour le patient:', patientId);
    this.userRole$.pipe(take(1)).subscribe((role) => {
      console.log('[DEBUG] Rôle détecté:', role);
      // Redirection vers les détails pour tous les rôles autorisés
      if (role === Role.SECRETAIRE || role === Role.DOCTEUR || role === Role.INFIRMIER) {
        this.viewPatient(patientId);
      } else {
        this.viewDossierByPatient(patientId);
      }
    });
  }

  viewPatient(id: number) {
    this.router.navigate(['/patients', id]);
  }

  editPatient(id: number) {
    this.router.navigate(['/patients', id, 'edit']);
  }

  deletePatient(id: number) {
    void this.confirmAndDeletePatient(id);
  }

  private async confirmAndDeletePatient(id: number) {
    const ok = await this.alerts.confirmDelete('ce patient');
    if (!ok) return;

    this.store.delete(id).subscribe({
      next: () => this.loadPatients(),
      error: (err) => {
        console.error('Erreur suppression patient', err);
        const msg = this.extractErrorMessage(err);
        void this.alerts.error(msg || 'Erreur lors de la suppression du patient');
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

  getInitials(row: PatientDto): string {
    const nom = (row.userInfo?.nom || row.nom || '').trim();
    const prenom = (row.userInfo?.prenom || row.prenom || '').trim();
    const first = nom.length > 0 ? nom[0] : '';
    const second = prenom.length > 0 ? prenom[0] : '';
    const initials = `${first}${second}`.toUpperCase();
    return initials || '?';
  }


  get filteredPatients(): PatientDto[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.patients;

    return this.patients.filter((p) => {
      const haystack = [
        p.userInfo?.nom || p.nom,
        p.userInfo?.prenom || p.prenom,
        p.cin,
        p.userInfo?.email || p.email,
        p.telephone,
        p.adresse,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }
}