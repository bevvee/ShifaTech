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
import { Store as NgrxStore } from '@ngrx/store';
import { selectAuthUser, selectUserProfile, selectUserRole } from '../../core/store/auth/auth.selectors';
import { DoctorService } from '../../core/services/doctor.service';
import { forkJoin, of } from 'rxjs';
import { take, switchMap, map, catchError } from 'rxjs/operators';
import { Role } from '../../core/models/role.enum';
import { Doctor } from '../../core/models/doctor.model';
import { PatientApiService } from '../../core/services/api/patient-api.service';
import { PatientDto } from '../../core/models/patient.model';

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
  loading = true;

  private readonly router = inject(Router);
  private readonly store = inject(OrdonnanceStore);
  private readonly alerts = inject(AlertService);
  private readonly authStore = inject(NgrxStore);
  private readonly doctorService = inject(DoctorService);
  private readonly patientApi = inject(PatientApiService);

  ngOnInit(): void {
    this.loadOrdonnances();
  }

  /*
  loadOrdonnances() {
    this.ordonnances = this.store.getAll();
  }
  */

  loadOrdonnances() {
    this.loading = true;
    this.authStore.select(selectUserRole).pipe(
      take(1),
      switchMap((role) => {
        if (role === Role.DOCTEUR) {
          return forkJoin({
            user: this.authStore.select(selectAuthUser).pipe(take(1)),
            profile: this.authStore.select(selectUserProfile).pipe(take(1)),
            doctors: this.doctorService.getDoctors().pipe(catchError(() => of([] as Doctor[])))
          }).pipe(
            switchMap(({ user, profile, doctors }) => {
              const userId = (profile as any)?.idUser ?? (user as any)?.idUser ?? (user as any)?.id ?? (profile as any)?.id;
              const match = doctors.find(d => Number(d.idUser) === Number(userId));
              const myDoctorId = match?.idDocteur;
              
              if (myDoctorId) {
                return this.store.getAll(Number(myDoctorId)).pipe(
                  switchMap(data => {
                    if (data && data.length > 0) return of(data);
                    // Fallback to userId if PK returns nothing
                    if (userId && Number(userId) !== Number(myDoctorId)) {
                      return this.store.getAll(Number(userId));
                    }
                    return of(data);
                  })
                );
              } else if (userId) {
                return this.store.getAll(Number(userId));
              }
              return this.store.getAll();
            })
          );
        } else {
          return this.store.getAll();
        }
      })
    ).pipe(
      switchMap((data: OrdonnanceDto[]) => {
        return this.patientApi.getAll().pipe(
          map((patients: PatientDto[]) => {
            const patientSexeById = new Map<number, string>();
            for (const p of patients) {
              if (p.id != null) patientSexeById.set(Number(p.id), p.sexe);
              if (p.idUser != null) patientSexeById.set(Number(p.idUser), p.sexe);
            }

            return data.map(o => ({
              ...o,
              patientImage: patientSexeById.get(Number(o.idPatient)) === 'F' 
                ? 'assets/img/patient-female.png' 
                : 'assets/img/patient-male.png'
            } as any));
          }),
          catchError(() => of(data as any[]))
        );
      })
    ).subscribe({
      next: (data) => this.ordonnances = data,
      error: (err) => console.error('Erreur chargement ordonnances', err),
      complete: () => this.loading = false,
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

  async deleteOrdonnance(id: number) {
    const ok = await this.alerts.confirmDelete('cette ordonnance');
    if (!ok) return;

    this.store.delete(id).subscribe({
      next: () => this.loadOrdonnances(),
      error: (err) => {
        console.error('Erreur suppression ordonnance', err);
        void this.alerts.error('Erreur lors de la suppression de l\'ordonnance.');
      }
    });
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
