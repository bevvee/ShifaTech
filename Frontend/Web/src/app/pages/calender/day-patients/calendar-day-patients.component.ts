import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { RdvService } from '../../../core/services/rdv.service';
import { PatientApiService } from '../../../core/services/api/patient-api.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { PatientDto } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { RdvDto } from '../../../core/models/rdv.model';
import { selectAuthUser, selectUserProfile, selectUserRole } from '../../../core/store/auth/auth.selectors';
import { Role } from '../../../core/models/role.enum';

type DateKey = string; // YYYY-MM-DD

interface DayPatientItem {
  patientId: number;
  patientName: string;
  times: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-calendar-day-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-day-patients.component.html',
})
export class CalendarDayPatientsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly rdvService = inject(RdvService);
  private readonly patientApi = inject(PatientApiService);
  private readonly doctorService = inject(DoctorService);

  dateKey: DateKey | null = null;
  isLoading = false;
  patients: DayPatientItem[] = [];

  ngOnInit() {
    this.isLoading = true;

    this.route.paramMap
      .pipe(
        map((pm) => pm.get('date') as DateKey | null),
        switchMap((dateKey) => {
          this.dateKey = dateKey;
          if (!dateKey) return of([] as DayPatientItem[]);

          const nextDayKey = this.addDays(dateKey, 1);

          return forkJoin({
            role: this.store.select(selectUserRole).pipe(take(1), catchError(() => of(null))),
            user: this.store.select(selectAuthUser).pipe(take(1), catchError(() => of(null))),
            profile: this.store.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
            patients: this.patientApi.getAll().pipe(catchError(() => of([] as PatientDto[]))),
            doctors: this.doctorService.getDoctors().pipe(catchError(() => of([] as Doctor[]))),
          }).pipe(
            switchMap(({ role, user, profile, patients, doctors }) => {
              const isDoctor = role === Role.DOCTEUR;

              const rawUserId =
                (profile as any)?.idUser ??
                (profile as any)?.id_user ??
                (profile as any)?.userId ??
                (profile as any)?.id ??
                (user as any)?.idUser ??
                (user as any)?.id_user ??
                (user as any)?.userId ??
                (user as any)?.id ??
                null;
              const userId = rawUserId != null ? Number(rawUserId) : null;
              const myDoctorId = isDoctor ? this.resolveDoctorId(userId, doctors) : null;

              const primaryDoctorIdForQuery = isDoctor ? (userId ?? myDoctorId) : null;
              const secondaryDoctorIdForQuery =
                isDoctor && primaryDoctorIdForQuery != null && myDoctorId != null && Number(myDoctorId) !== Number(primaryDoctorIdForQuery)
                  ? myDoctorId
                  : null;

              const baseParams: Record<string, string | number> = {
                page: 1,
                itemsPerPage: 200,
                'date_rdv[after]': dateKey,
              };
              if (nextDayKey) {
                baseParams['date_rdv[before]'] = nextDayKey;
              }

              const rdv$ = isDoctor && primaryDoctorIdForQuery != null
                ? this.rdvService.getAll({ ...baseParams, id_docteur: primaryDoctorIdForQuery })
                : this.rdvService.getAll(baseParams);

              return rdv$.pipe(
                map((rdvRes) => ({ rdvRes, isDoctor, secondaryDoctorIdForQuery, patients, baseParams })),
                catchError(() => of({ rdvRes: [] as any, isDoctor, secondaryDoctorIdForQuery, patients, baseParams }))
              );
            }),
            switchMap(({ rdvRes, isDoctor, secondaryDoctorIdForQuery, patients, baseParams }) => {
              const primary = this.extractRdvArray(rdvRes);
              if (isDoctor && primary.length === 0 && secondaryDoctorIdForQuery != null) {
                return this.rdvService.getAll({ ...baseParams, id_docteur: secondaryDoctorIdForQuery }).pipe(
                  map((altRes) => ({ rdvRes: altRes, patients })),
                  catchError(() => of({ rdvRes, patients }))
                );
              }
              return of({ rdvRes, patients });
            }),
            map(({ rdvRes, patients }) => {
              const rdvs = this.extractRdvArray(rdvRes);

              const patientNameByUserId = new Map<number, string>();
              const patientNameByPatientId = new Map<number, string>();
              for (const p of patients) {
                const full = `${p.prenom ?? ''} ${p.nom ?? ''}`.trim();
                if (p.idUser != null) patientNameByUserId.set(Number(p.idUser), full || `Patient #${p.idUser}`);
                if (p.id != null) patientNameByPatientId.set(Number(p.id), full || `Patient #${p.id}`);
              }

              // Backend already filtered to this day via date_rdv[after]/[before]; keep a safety filter.
              const dayRdvs = rdvs.filter((r) => this.toDateKey((r as any).date_rdv) === dateKey);
              return this.toUniquePatients(dayRdvs, patientNameByUserId, patientNameByPatientId);
            })
          );
        })
      )
      .subscribe({
        next: (rows) => {
          this.patients = rows;
          this.isLoading = false;
        },
        error: () => {
          this.patients = [];
          this.isLoading = false;
        },
      });
  }

  private extractRdvArray(res: any): RdvDto[] {
    if (Array.isArray(res)) return res as RdvDto[];
    if (res && Array.isArray(res['hydra:member'])) return res['hydra:member'] as RdvDto[];
    if (res && Array.isArray(res.member)) return res.member as RdvDto[];
    if (res && Array.isArray(res.data)) return res.data as RdvDto[];
    if (res && Array.isArray(res.items)) return res.items as RdvDto[];
    return [];
  }

  private resolveDoctorId(profileUserId: number | null, doctors: Doctor[]): number | null {
    if (profileUserId == null) return null;
    const match = doctors.find((d) => Number(d.idUser) === Number(profileUserId));
    return match?.idDocteur != null ? Number(match.idDocteur) : null;
  }

  private toUniquePatients(
    rdvs: RdvDto[],
    patientNameByUserId: Map<number, string>,
    patientNameByPatientId: Map<number, string>
  ): DayPatientItem[] {
    const byPatient = new Map<number, { name: string; times: Set<string> }>();

    for (const rdv of rdvs) {
      const patientId = Number((rdv as any).id_patient);
      const patientName =
        patientNameByUserId.get(patientId) ??
        patientNameByPatientId.get(patientId) ??
        `Patient #${patientId}`;

      const startTime = String((rdv as any).heure_debut ?? '').slice(0, 5);
      const endTime = String((rdv as any).heure_fin ?? '').slice(0, 5);
      const time = this.formatTimeRange(startTime, endTime);

      const entry = byPatient.get(patientId) ?? { name: patientName, times: new Set<string>() };
      if (!byPatient.has(patientId)) byPatient.set(patientId, entry);
      if (time) entry.times.add(time);
    }

    return Array.from(byPatient.entries()).map(([patientId, v]) => ({
      patientId,
      patientName: v.name,
      times: Array.from(v.times.values()).join(', '),
      avatarUrl: this.getPatientAvatarUrl(patientId),
    }));
  }

  private formatTimeRange(startTime: string, endTime: string): string {
    const s = String(startTime ?? '').trim();
    const e = String(endTime ?? '').trim();
    if (!s && !e) return '';
    if (s && e) return `${s}-${e}`;
    return s || e;
  }

  private toDateKey(value: unknown): DateKey | null {
    if (value == null) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);

    const raw = String(value);
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
  }

  private getPatientAvatarUrl(patientId: number): string {
    const max = 37;
    const idx = ((Math.abs(Number(patientId)) - 1) % max) + 1;
    const padded = String(idx).padStart(2, '0');
    return `/images/user/user-${padded}.jpg`;
  }

  private addDays(dateKey: DateKey, days: number): DateKey | null {
    const raw = String(dateKey ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    const d = new Date(`${raw}T00:00:00`);
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + Number(days));
    return d.toISOString().slice(0, 10);
  }
}
