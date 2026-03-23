import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { PatientsStore } from './patients.store';
import { DossierMedicalStore } from '../dossier-medical/dossier-medical.store';
import { PatientDto } from '../../core/models/patient.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './patients.component.html'
})
export class PatientsComponent implements OnInit {

  searchTerm = '';
  patients: PatientDto[] = [];

  private readonly router = inject(Router);
  private readonly store = inject(PatientsStore);
  private readonly dossierStore = inject(DossierMedicalStore);
  private readonly alerts = inject(AlertService);

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients() {
    this.store.getAll().subscribe({
      next: (data) => this.patients = data,
      error: (err) => console.error('Erreur chargement patients', err)
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
        void this.alerts.error('Erreur lors de la suppression du patient');
      }
    });
  }

  getInitials(row: PatientDto): string {
    const nom = row.nom?.trim() ?? '';
    const prenom = row.prenom?.trim() ?? '';
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
        p.nom,
        p.prenom,
        p.cin,
        p.email,
        p.telephone,
        p.adresse,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }
}