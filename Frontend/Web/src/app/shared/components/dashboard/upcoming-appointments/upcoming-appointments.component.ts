import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RdvService } from '../../../../core/services/rdv.service';
import { PatientApiService } from '../../../../core/services/api/patient-api.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { selectAuthUser, selectUserProfile, selectUserRole } from '../../../../core/store/auth/auth.selectors';
import { Role } from '../../../../core/models/role.enum';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

type UnknownRecord = Record<string, any>;

type DateKey = string; // YYYY-MM-DD

interface Doctor {
  idDocteur?: number;
  idUser?: number;
}

interface AppointmentDisplay {
  id: number | string;
  patientName: string;
  patientId: string;
  appointmentType: string;
  dateLabel: string;
  timeLabel: string;
  startTime: string;
  endTime: string;
  department: string;
  consultationType: string;
  status: string;
}

@Component({
  selector: 'app-upcoming-appointments',
  imports: [CommonModule],
  templateUrl: './upcoming-appointments.component.html',
})
export class UpcomingAppointmentsComponent implements OnInit, OnDestroy {
  private readonly rdvService = inject(RdvService);
  private readonly patientApi = inject(PatientApiService);
  private readonly doctorService = inject(DoctorService);
  private readonly store = inject(Store);
  private readonly subscription = new Subscription();

  todayLabel = '';
  isDoctorView = false;
  currentAppointment: AppointmentDisplay | null = null;
  remainingAppointments: AppointmentDisplay[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.todayLabel = this.formatTodayLabel(new Date());
    this.loadTodaySchedule();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadTodaySchedule(): void {
    this.isLoading = true;

    this.subscription.add(
      forkJoin({
        role: this.store.select(selectUserRole).pipe(take(1), catchError(() => of(null))),
        user: this.store.select(selectAuthUser).pipe(take(1), catchError(() => of(null))),
        profile: this.store.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
        patientsRes: this.patientApi.getAll().pipe(catchError(() => of([] as any))),
        doctors: this.doctorService.getDoctors().pipe(catchError(() => of([] as Doctor[]))),
      }).pipe(
        switchMap(({ role, user, profile, patientsRes, doctors }): Observable<{ isDoctor: boolean; displays: AppointmentDisplay[] }> => {
          const patients = this.extractPatientArray(patientsRes);

          const patientById = new Map<number, UnknownRecord>();
          for (const p of patients) {
            const id = Number((p as any)?.id);
            if (!Number.isNaN(id)) patientById.set(id, p);
          }

          const isDoctor = role === Role.DOCTEUR;
          const today = new Date();
          const todayKey = this.toDateKey(today);
          const tomorrowKey = this.toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));

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

          // IMPORTANT: rdv-service security compares id_docteur to JWT user identifier,
          // so the safest primary filter for a logged-in doctor is the auth userId.
          const primaryDoctorIdForQuery = isDoctor ? (userId ?? myDoctorId) : null;
          const secondaryDoctorIdForQuery =
            isDoctor && primaryDoctorIdForQuery != null && myDoctorId != null && Number(myDoctorId) !== Number(primaryDoctorIdForQuery)
              ? myDoctorId
              : null;

          const baseParams: Record<string, string | number> = {};
          baseParams['page'] = 1;
          baseParams['itemsPerPage'] = 200;
          if (todayKey) {
            baseParams['date_rdv[after]'] = todayKey;
            if (tomorrowKey) {
              baseParams['date_rdv[before]'] = tomorrowKey;
            }
          }
          if (primaryDoctorIdForQuery != null) {
            baseParams['id_docteur'] = primaryDoctorIdForQuery;
          }

          const rdv$: Observable<UnknownRecord[]> = this.rdvService.getAll(baseParams).pipe(
            map((res: any) => this.extractRdvArray(res) as UnknownRecord[]),
            catchError(() => of([] as UnknownRecord[])),
            switchMap((rdvs: UnknownRecord[]) => {
              // Fallback 1: if date filters aren't supported server-side, retry only with id_docteur.
              if (rdvs.length === 0 && primaryDoctorIdForQuery != null) {
                return this.rdvService.getAll({ id_docteur: primaryDoctorIdForQuery }).pipe(
                  map((res: any) => this.extractRdvArray(res) as UnknownRecord[]),
                  catchError(() => of([] as UnknownRecord[])),
                  // Fallback 2: if primary doctor id doesn't match stored rdvs, try doctor table idDocteur.
                  switchMap((rdvs2: UnknownRecord[]) => {
                    if (rdvs2.length === 0 && secondaryDoctorIdForQuery != null) {
                      return this.rdvService.getAll({ id_docteur: secondaryDoctorIdForQuery }).pipe(
                        map((res: any) => this.extractRdvArray(res) as UnknownRecord[]),
                        catchError(() => of([] as UnknownRecord[]))
                      );
                    }
                    return of(rdvs2);
                  })
                );
              }

              // If the main query returned empty, try the secondary doctor id with the same date range.
              if (rdvs.length === 0 && secondaryDoctorIdForQuery != null) {
                const altParams = { ...baseParams, id_docteur: secondaryDoctorIdForQuery };
                return this.rdvService.getAll(altParams).pipe(
                  map((res: any) => this.extractRdvArray(res) as UnknownRecord[]),
                  catchError(() => of([] as UnknownRecord[]))
                );
              }

              return of(rdvs);
            })
          );

          return rdv$.pipe(
            map((rdvs: UnknownRecord[]) => {
              const todays = todayKey
                ? rdvs.filter((r: UnknownRecord) => this.toDateKey((r as any)?.date_rdv) === todayKey)
                : rdvs;

              const displays = todays
                .map((r: UnknownRecord) => this.mapToAppointmentDisplay(r, patientById))
                .filter(Boolean) as AppointmentDisplay[];

              displays.sort((a, b) => a.startTime.localeCompare(b.startTime));

              return {
                isDoctor,
                displays,
              };
            })
          );
        })
      ).subscribe(({ isDoctor, displays }: { isDoctor: boolean; displays: AppointmentDisplay[] }) => {
        this.isDoctorView = isDoctor;
        const { current, remaining } = this.splitCurrentAndRemaining(displays);
        this.currentAppointment = current;
        this.remainingAppointments = remaining;
        this.isLoading = false;
      })
    );
  }

  private extractRdvArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res['hydra:member'])) return res['hydra:member'];
    if (res && Array.isArray(res.member)) return res.member;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  }

  private extractPatientArray(res: any): UnknownRecord[] {
    if (Array.isArray(res)) return res as UnknownRecord[];
    if (res && Array.isArray(res['hydra:member'])) return res['hydra:member'] as UnknownRecord[];
    if (res && Array.isArray(res.data)) return res.data as UnknownRecord[];
    if (res && Array.isArray(res.items)) return res.items as UnknownRecord[];
    if (res && Array.isArray(res.member)) return res.member as UnknownRecord[];
    return [];
  }

  private resolveDoctorId(profileUserId: number | null, doctors: Doctor[]): number | null {
    if (profileUserId == null) return null;
    const match = doctors.find(d => Number(d.idUser) === Number(profileUserId));
    return match?.idDocteur != null ? Number(match.idDocteur) : null;
  }

  private toDateKey(value: unknown): DateKey | null {
    if (value == null) return null;

    if (typeof value === 'string') {
      const s = value.trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        return s.slice(0, 10);
      }
    }

    const d = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private splitCurrentAndRemaining(list: AppointmentDisplay[]): {
    current: AppointmentDisplay | null;
    remaining: AppointmentDisplay[];
  } {
    if (!list.length) return { current: null, remaining: [] };

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const appts = [...list].sort((a, b) => a.startTime.localeCompare(b.startTime));

    let current: AppointmentDisplay | null = null;

    for (const a of appts) {
      const start = this.parseTimeToMinutes(a.startTime);
      const end = a.endTime ? this.parseTimeToMinutes(a.endTime) : start + 30;
      if (start <= nowMin && nowMin < end) {
        current = a;
        break;
      }
    }

    if (!current) {
      current = appts.find(a => this.parseTimeToMinutes(a.startTime) >= nowMin) ?? appts[appts.length - 1];
    }

    const currentStart = this.parseTimeToMinutes(current.startTime);
    const remaining = appts.filter(a => a !== current && this.parseTimeToMinutes(a.startTime) > currentStart);
    return { current, remaining };
  }

  private parseTimeToMinutes(time: string): number {
    const [hh, mm] = String(time ?? '').slice(0, 5).split(':');
    const h = Number(hh);
    const m = Number(mm);
    if (Number.isNaN(h) || Number.isNaN(m)) return 0;
    return h * 60 + m;
  }

  private mapToAppointmentDisplay(rdv: UnknownRecord, patientById: Map<number, UnknownRecord>): AppointmentDisplay | null {
    const patientIdRaw = (rdv as any)?.id_patient ?? (rdv as any)?.idPatient ?? (rdv as any)?.patient_id;
    const patientIdNum = Number(patientIdRaw);
    const patient = !Number.isNaN(patientIdNum) ? patientById.get(patientIdNum) : undefined;

    const patientName = patient
      ? `${String((patient as any)?.prenom ?? '').trim()} ${String((patient as any)?.nom ?? '').trim()}`.trim() || `Patient #${patientIdNum}`
      : Number.isNaN(patientIdNum)
        ? 'Patient'
        : `Patient #${patientIdNum}`;

    const startTime = String((rdv as any)?.heure_debut ?? '').slice(0, 5) || '00:00';
    const endTime = String((rdv as any)?.heure_fin ?? '').slice(0, 5) || '';
    const id = (rdv as any)?.id_rdv ?? (rdv as any)?.id ?? '';
    const status = String((rdv as any)?.statut ?? '').trim();

    const dateLabel = this.formatDateLabel((rdv as any)?.date_rdv);
    const timeLabel = this.formatTimeLabel(startTime);
    const appointmentType = String((rdv as any)?.type ?? (rdv as any)?.type_rdv ?? 'General Visit');
    const department = String((patient as any)?.specialite ?? (patient as any)?.service ?? 'General');
    const consultationType = this.mapConsultationType(status);

    return {
      id,
      patientName,
      patientId: Number.isNaN(patientIdNum) ? '' : `#AP${patientIdNum.toString().padStart(6, '0')}`,
      appointmentType,
      dateLabel,
      timeLabel,
      startTime,
      endTime,
      department,
      consultationType,
      status,
    };
  }

  private formatDateLabel(value: unknown): string {
    const d = value instanceof Date ? value : new Date(String(value ?? ''));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatTimeLabel(hhmm: string): string {
    const [hStr, mStr] = String(hhmm ?? '').slice(0, 5).split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) return '';

    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private mapConsultationType(status: string): string {
    const s = String(status ?? '').trim().toUpperCase();
    if (s === 'CONFIRME' || s === 'CONFIRMÉ' || s === 'CONFIRMED') return 'Online Consultation';
    return 'Consultation';
  }

  private formatTodayLabel(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
