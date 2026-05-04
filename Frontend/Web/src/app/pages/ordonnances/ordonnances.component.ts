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
    
    forkJoin({
      role: this.authStore.select(selectUserRole).pipe(take(1), catchError(() => of(null))),
      user: this.authStore.select(selectAuthUser).pipe(take(1), catchError(() => of(null))),
      profile: this.authStore.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
      doctors: this.doctorService.getDoctors().pipe(catchError(() => of([] as Doctor[]))),
      patients: this.patientApi.getAll().pipe(catchError(() => of([] as PatientDto[])))
    }).pipe(
      switchMap(({ role, user, profile, doctors, patients }) => {
        const isDoctor = role === Role.DOCTEUR;
        const userId = this.getAuthUserId(user, profile);
        const myDoctorId = isDoctor ? this.resolveDoctorId(userId, doctors) : null;

        // Prioritize myDoctorId (real doctor PK) over userId
        const primaryId = isDoctor ? (myDoctorId ?? userId) : null;

        const fetch$ = isDoctor 
          ? this.doctorService.getMyOrdonnances().pipe(
              map(res => res.data || res),
              switchMap(data => {
                // FALLBACK: If proxy returns nothing but we have a primaryId, try direct call
                if ((!data || (Array.isArray(data) && data.length === 0)) && primaryId) {
                  return this.store.getAll(Number(primaryId)).pipe(catchError(() => of([])));
                }
                return of(data);
              })
            )
          : this.store.getAll(primaryId ? Number(primaryId) : undefined);

        return fetch$.pipe(
          switchMap(data => {
            return of({ data: Array.isArray(data) ? data : [], patients });
          }),
          catchError(() => of({ data: [] as OrdonnanceDto[], patients }))
        );
      }),
      map(({ data, patients }) => {
        const patientLookup = new Map<number, PatientDto>();
        for (const p of patients) {
          const pid = p.id ?? (p as any).idPatient;
          if (pid != null) patientLookup.set(Number(pid), p);
        }

        return data.map((o: OrdonnanceDto) => {
          const pid = Number(o.idPatient);
          const p = patientLookup.get(pid);
          
          return {
            ...o,
            id: o.id ?? (o as any).idOrdonnance,
            nomPatient: o.nomPatient || (p ? `${p.prenom ?? ''} ${p.nom ?? ''}`.trim() : `Patient #${pid}`),
            numDossier: o.numDossier || p?.numDossier || '',
            patientImage: (o.sexePatient || p?.sexe) === 'F' 
              ? 'assets/img/patient-female.png' 
              : 'assets/img/patient-male.png'
          } as any;
        });
      })
    ).subscribe({
      next: (data) => {
        this.ordonnances = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement ordonnances', err);
        this.loading = false;
      }
    });
  }

  private getAuthUserId(user: any, profile: any): number | null {
    const raw = profile?.idUser ?? profile?.id_user ?? profile?.userId ?? profile?.id ??
                user?.idUser ?? user?.id_user ?? user?.userId ?? user?.id ?? null;
    return raw != null ? Number(raw) : null;
  }

  private resolveDoctorId(userId: number | null, doctors: Doctor[]): number | null {
    if (userId == null) return null;
    const match = doctors.find(d => Number(d.idUser) === Number(userId));
    return match?.idDocteur != null ? Number(match.idDocteur) : null;
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
    if (ok) {
      this.store.delete(id).subscribe({
        next: () => this.loadOrdonnances(),
        error: (err) => {
          console.error('Erreur suppression ordonnance', err);
          const msg = this.extractErrorMessage(err);
          void this.alerts.error(msg || 'Erreur lors de la suppression de l’ordonnance');
        }
      });
    }
  }

  private extractErrorMessage(err: any): string | null {
    if (err.error?.data && typeof err.error.data === 'object') {
      const errors = err.error.data;
      return Object.values(errors).join('\n');
    }
    return err.error?.message || err.message || null;
  }

  getStatusBadgeColor(status: OrdonnanceStatut): 'success' | 'warning' | 'error' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'EXPIRED') return 'warning';
    return 'error';
  }

  getInitials(row: OrdonnanceDto): string {
    const name = row.nomPatient?.trim() ?? '';
    if (!name) return '?';
    const parts = name.split(' ');
    const first = parts[0] ? parts[0][0] : '';
    const second = parts[1] ? parts[1][0] : '';
    return `${first}${second}`.toUpperCase() || '?';
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
