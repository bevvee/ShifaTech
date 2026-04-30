import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RdvService } from '../../../../core/services/rdv.service';
import { selectAuthUser, selectUserProfile, selectUserRole } from '../../../../core/store/auth/auth.selectors';
import { Role } from '../../../../core/models/role.enum';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

type DateKey = string; // YYYY-MM-DD

interface RendezVousViewItem {
  id?: number;
  idPatient?: number;
  idDocteur?: number;
  dateRdv?: string;
  heureDebut?: string;
  heureFin?: string;
  statut?: string;
  patient?: { nom?: string; prenom?: string; email?: string; telephone?: string } | null;
  docteur?: { nom?: string; prenom?: string } | null;
}

interface DayGroup {
  dateKey: DateKey;
  dateLabel: string;
  appointments: AppointmentDisplay[];
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
  dateKey: DateKey;
}

@Component({
  selector: 'app-upcoming-appointments',
  imports: [CommonModule],
  templateUrl: './upcoming-appointments.component.html',
})
export class UpcomingAppointmentsComponent implements OnInit, OnDestroy {
  private readonly rdvService = inject(RdvService);
  private readonly store = inject(Store);
  private readonly subscription = new Subscription();

  todayLabel = '';
  isDoctorView = false;
  currentAppointment: AppointmentDisplay | null = null;
  remainingAppointments: AppointmentDisplay[] = [];
  upcomingByDay: DayGroup[] = [];
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
      }).pipe(
        switchMap(({ role, user, profile }): Observable<{ isDoctor: boolean; displays: AppointmentDisplay[] }> => {
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

          const doctorIdForQuery = isDoctor ? userId : null;
          if (!doctorIdForQuery) {
            return of({ isDoctor, displays: [] as AppointmentDisplay[] });
          }

          return this.rdvService.getRendezVousViewCurrent({ id_docteur: doctorIdForQuery }).pipe(
            map((res: any) => this.extractRdvArray(res) as RendezVousViewItem[]),
            catchError(() => of([] as RendezVousViewItem[])),
            map((items: RendezVousViewItem[]) => {
              const displays = items
                .map((item: RendezVousViewItem) => this.mapViewToAppointmentDisplay(item))
                .filter(Boolean) as AppointmentDisplay[];

              displays.sort((a, b) => {
                const dk = a.dateKey.localeCompare(b.dateKey);
                if (dk !== 0) return dk;
                return a.startTime.localeCompare(b.startTime);
              });

              return { isDoctor, displays };
            })
          );
        })
      ).subscribe(({ isDoctor, displays }: { isDoctor: boolean; displays: AppointmentDisplay[] }) => {
        this.isDoctorView = isDoctor;
        const todayKey = this.toDateKey(new Date()) ?? '';
        const todaysDisplays = todayKey ? displays.filter(d => d.dateKey === todayKey) : displays;
        const { current, remaining } = this.splitCurrentAndRemaining(todaysDisplays);
        this.currentAppointment = current;
        this.remainingAppointments = remaining;
        this.upcomingByDay = this.buildUpcomingByDay(displays, todayKey);
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

  private buildUpcomingByDay(displays: AppointmentDisplay[], todayKey: DateKey): DayGroup[] {
    const grouped = new Map<DateKey, AppointmentDisplay[]>();

    for (const d of displays) {
      if (!d.dateKey || d.dateKey === todayKey) continue;
      const list = grouped.get(d.dateKey) ?? [];
      list.push(d);
      grouped.set(d.dateKey, list);
    }

    const dayKeys = [...grouped.keys()].sort();
    return dayKeys.map((dateKey) => {
      const appointments = (grouped.get(dateKey) ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime));
      return {
        dateKey,
        dateLabel: this.formatDateLabel(dateKey),
        appointments,
      };
    });
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

  private mapViewToAppointmentDisplay(item: RendezVousViewItem): AppointmentDisplay | null {
    const patientIdNum = Number((item as any)?.idPatient ?? (item as any)?.id_patient ?? (item as any)?.patientId);
    const patientNameRaw = `${String(item.patient?.prenom ?? '').trim()} ${String(item.patient?.nom ?? '').trim()}`.trim();
    const patientName = patientNameRaw || (Number.isNaN(patientIdNum) ? 'Patient' : `Patient #${patientIdNum}`);

    const dateKey = this.toDateKey(item.dateRdv);
    if (!dateKey) return null;

    const startTime = String(item.heureDebut ?? '').slice(0, 5) || '00:00';
    const endTime = String(item.heureFin ?? '').slice(0, 5) || '';
    const status = String(item.statut ?? '').trim();

    const startLabel = this.formatTimeLabel(startTime);
    const endLabel = endTime ? this.formatTimeLabel(endTime) : '';
    const timeLabel = endLabel ? `${startLabel} - ${endLabel}` : startLabel;

    return {
      id: item.id ?? '',
      patientName,
      patientId: Number.isNaN(patientIdNum) ? '' : `#AP${patientIdNum.toString().padStart(6, '0')}`,
      appointmentType: 'Rendez-vous',
      dateLabel: this.formatDateLabel(dateKey),
      timeLabel,
      startTime,
      endTime,
      department: '-',
      consultationType: this.mapConsultationType(status),
      status,
      dateKey,
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
