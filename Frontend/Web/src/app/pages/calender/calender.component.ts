import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';

import { Component, ViewChild, inject } from '@angular/core';
import { CalendarOptions, DayCellMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { RdvService } from '../../core/services/rdv.service';
import { PatientApiService } from '../../core/services/api/patient-api.service';
import { DoctorService } from '../../core/services/doctor.service';
import { PatientDto } from '../../core/models/patient.model';
import { Doctor } from '../../core/models/doctor.model';
import { RdvDto } from '../../core/models/rdv.model';
import { selectAuthUser, selectUserProfile, selectUserRole } from '../../core/store/auth/auth.selectors';
import { Role } from '../../core/models/role.enum';

type DateKey = string; // YYYY-MM-DD

interface DayAppointment {
  patientId: number;
  patientName: string;
  startTime: string;
  endTime: string;
}

interface DayPatientItem {
  patientId: number;
  patientName: string;
  times: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-calender',
  imports: [
    CommonModule,
    FullCalendarModule,
  ],
  templateUrl: './calender.component.html',
  styles: `
    :host ::ng-deep .fc .fc-toolbar-title {
      font-size: 1rem;
      line-height: 1.25rem;
    }

    :host ::ng-deep .fc .fc-daygrid-day-number {
      font-size: 0.7rem;
      padding: 1px 3px;
    }

    :host ::ng-deep .fc .fc-daygrid-day-frame {
      min-height: 72px;
    }

    :host ::ng-deep .fc .fc-scrollgrid-section table {
      font-size: 0.75rem;
    }

    :host ::ng-deep .fc-dayGridMonth-view .fc-col-header {
      display: none;
    }

    :host ::ng-deep .fc-dayGridMonth-view .fc-daygrid-day-frame {
      min-height: 34px;
    }

    :host ::ng-deep .fc-dayGridMonth-view .fc-daygrid-day-top {
      justify-content: flex-start;
    }

    :host ::ng-deep .fc-dayGridMonth-view .fc-daygrid-day-events,
    :host ::ng-deep .fc-dayGridMonth-view .fc-daygrid-day-bottom {
      display: none;
    }
  `
})
export class CalenderComponent {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private readonly rdvService = inject(RdvService);
  private readonly patientApi = inject(PatientApiService);
  private readonly doctorService = inject(DoctorService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();

  private appointmentsByDate = new Map<DateKey, DayAppointment[]>();

  // Navigation is used instead of an inline list.

  calendarOptions!: CalendarOptions;

  ngOnInit() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      slotMinTime: '08:00:00',
      slotMaxTime: '19:00:00',
      scrollTime: '08:00:00',
      fixedWeekCount: false,
      showNonCurrentDates: false,
      expandRows: false,
      height: 'auto',
      selectable: false,
      editable: false,
      eventStartEditable: false,
      eventDurationEditable: false,
      events: [],
      dateClick: (arg) => this.handleDateClick(arg),
      dayCellDidMount: (arg) => this.decorateDayCell(arg),
      eventContent: (arg) => this.renderEventContent(arg)
    };

    this.loadDoctorDayAppointments();
  }

  ngAfterViewInit() {
    this.requestCalendarRerender();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadDoctorDayAppointments(): void {
    this.subscription.add(
      forkJoin({
        role: this.store.select(selectUserRole).pipe(take(1), catchError(() => of(null))),
        user: this.store.select(selectAuthUser).pipe(take(1), catchError(() => of(null))),
        profile: this.store.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
        patients: this.patientApi.getAll().pipe(catchError(() => of([] as PatientDto[]))),
        doctors: this.doctorService.getDoctors().pipe(catchError(() => of([] as Doctor[]))),
      }).pipe(
        switchMap(({ role, user, profile, patients, doctors }) => {
          const isDoctor = role === Role.DOCTEUR;

          const userId =
            (profile as any)?.idUser ??
            (profile as any)?.id_user ??
            (profile as any)?.userId ??
            (profile as any)?.id ??
            (user as any)?.idUser ??
            (user as any)?.id_user ??
            (user as any)?.userId ??
            (user as any)?.id ??
            null;

          const userIdNum = userId != null ? Number(userId) : null;
          const myDoctorId = isDoctor ? this.resolveDoctorId(userIdNum, doctors) : null;

          const primaryDoctorIdForQuery = isDoctor ? (myDoctorId ?? userIdNum) : null;
          const secondaryDoctorIdForQuery =
            isDoctor && primaryDoctorIdForQuery != null && userIdNum != null && Number(userIdNum) !== Number(primaryDoctorIdForQuery)
              ? userIdNum
              : null;

          const baseParams: Record<string, string | number> = {
            page: 1,
            itemsPerPage: 1000,
          };

          const rdv$ = isDoctor && primaryDoctorIdForQuery != null
            ? this.rdvService.getAll({ ...baseParams, id_docteur: primaryDoctorIdForQuery })
            : this.rdvService.getAll(baseParams);

          return rdv$.pipe(
            map((rdvRes) => ({ rdvRes, isDoctor, secondaryDoctorIdForQuery, patients })),
            catchError(() => of({ rdvRes: [] as any, isDoctor, secondaryDoctorIdForQuery, patients }))
          );
        }),
        switchMap(({ rdvRes, isDoctor, secondaryDoctorIdForQuery, patients }) => {
          const primary = this.extractRdvArray(rdvRes);
              if (isDoctor && primary.length === 0 && secondaryDoctorIdForQuery != null) {
                return this.rdvService.getAll({ id_docteur: secondaryDoctorIdForQuery, page: 1, itemsPerPage: 1000 }).pipe(
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
          const patientSexeById = new Map<number, string>();
          for (const p of patients) {
            const full = `${p.prenom ?? ''} ${p.nom ?? ''}`.trim();
            if (p.idUser != null) {
              patientNameByUserId.set(Number(p.idUser), full || `Patient #${p.idUser}`);
              patientSexeById.set(Number(p.idUser), p.sexe ?? 'M');
            }
            if (p.id != null) {
              patientNameByPatientId.set(Number(p.id), full || `Patient #${p.id}`);
              patientSexeById.set(Number(p.id), p.sexe ?? 'M');
            }
          }

          return { rdvs, patientNameByUserId, patientNameByPatientId, patientSexeById, patients };
        })
      ).subscribe(({ rdvs, patientNameByUserId, patientNameByPatientId, patientSexeById, patients }) => {
        // Filter only confirmed appointments for the calendar
        const confirmedRdvs = rdvs.filter(r => (r as any).statut === 'CONFIRME');
        this.appointmentsByDate = this.buildDayAppointmentsMap(confirmedRdvs, patients, patientNameByUserId, patientNameByPatientId);
        
        // Populate FullCalendar events for TimeGrid (Week/Day) views
        this.calendarOptions.events = confirmedRdvs.map(r => {
          const date = this.toDateKey((r as any).date_rdv);
          const startT = this.extractTime((r as any).heure_debut) || '00:00:00';
          const endT = this.extractTime((r as any).heure_fin) || '00:00:00';
          const start = `${date}T${startT}`;
          const end = `${date}T${endT}`;
          const patientId = Number((r as any).id_patient);
          const patientName = patientNameByUserId.get(patientId) ?? patientNameByPatientId.get(patientId) ?? `Patient #${patientId}`;
          const sexe = patientSexeById.get(patientId) || 'M';
          
          return {
            title: patientName,
            start,
            end,
            extendedProps: { patientId, patientName, sexe }
          };
        });

        this.requestCalendarRerender();
      })
    );
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
    const match = doctors.find(d => Number(d.idUser) === Number(profileUserId));
    return match?.idDocteur != null ? Number(match.idDocteur) : null;
  }

  private buildDayAppointmentsMap(
    rdvs: RdvDto[],
    patients: PatientDto[],
    patientNameByUserId: Map<number, string>,
    patientNameByPatientId: Map<number, string>
  ): Map<DateKey, DayAppointment[]> {
    const mapByDate = new Map<DateKey, DayAppointment[]>();
    const patientSexeById = new Map<number, string>();
    for (const p of patients) {
      if (p.id != null) patientSexeById.set(Number(p.id), p.sexe ?? 'M');
      if (p.idUser != null) patientSexeById.set(Number(p.idUser), p.sexe ?? 'M');
    }

    for (const rdv of rdvs) {
      const dateKey = this.toDateKey((rdv as any).date_rdv);
      if (!dateKey) continue;

      const patientId = Number((rdv as any).id_patient);
      const patientName =
        patientNameByUserId.get(patientId) ??
        patientNameByPatientId.get(patientId) ??
        `Patient #${patientId}`;

      const startTime = this.extractTime((rdv as any).heure_debut).slice(0, 5);
      const endTime = this.extractTime((rdv as any).heure_fin).slice(0, 5);
      const sexe = patientSexeById.get(patientId);

      const list = mapByDate.get(dateKey) ?? [];
      if (!mapByDate.has(dateKey)) mapByDate.set(dateKey, list);

      list.push({
        patientId,
        patientName,
        startTime,
        endTime,
        sexe: sexe || 'M'
      } as any);
    }

    for (const [k, list] of mapByDate.entries()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
      mapByDate.set(k, list);
    }

    return mapByDate;
  }

  private decorateDayCell(arg: DayCellMountArg): void {
    if (arg.view.type !== 'dayGridMonth') return;
    
    const dateKey = this.toDateKey(arg.date);
    if (!dateKey) return;

    const list = this.appointmentsByDate.get(dateKey);
    if (!list || list.length === 0) return;

    const uniquePatients = this.toUniquePatients(list);
    const patientCount = uniquePatients.length;
    if (patientCount <= 0) return;

    (arg.el as HTMLElement).style.cursor = 'pointer';
    (arg.el as HTMLElement).title = `${patientCount} patient(s)`;

    const frame = (arg.el.querySelector('.fc-daygrid-day-frame') as HTMLElement | null) ?? arg.el;
    frame.style.position = 'relative';

    if (frame.querySelector('[data-rdv-avatars="true"]')) return;

    const container = document.createElement('div');
    container.setAttribute('data-rdv-avatars', 'true');
    container.style.position = 'absolute';
    container.style.left = '4px';
    container.style.bottom = '4px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '2px';
    container.style.cursor = 'pointer';
    container.style.pointerEvents = 'auto';
    container.title = `${patientCount} patient(s)`;

    const maxShown = 3;
    const shown = uniquePatients.slice(0, maxShown);
    const remaining = patientCount - shown.length;

    for (const p of shown) {
      const img = document.createElement('img');
      img.src = p.avatarUrl;
      img.alt = p.patientName;
      img.title = p.patientName;
      img.className = 'h-4 w-4 rounded-full object-cover ring-2 ring-white dark:ring-gray-900';
      container.appendChild(img);
    }

    if (remaining > 0) {
      const more = document.createElement('div');
      more.textContent = `+${remaining}`;
      more.className = 'h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold flex items-center justify-center bg-brand-500 text-white ring-2 ring-white dark:ring-gray-900';
      container.appendChild(more);
    }

    container.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.goToDayPatients(dateKey);
    });

    frame.appendChild(container);
  }

  private handleDateClick(arg: DateClickArg): void {
    const dateKey = this.toDateKey(arg.date);
    if (!dateKey) return;

    const list = this.appointmentsByDate.get(dateKey) ?? [];
    if (list.length === 0) return;

    this.goToDayPatients(dateKey);
  }

  private toUniquePatients(list: DayAppointment[]): DayPatientItem[] {
    const byPatient = new Map<number, { name: string; times: Set<string>; sexe?: string }>();
 
    for (const a of list) {
      const entry = byPatient.get(a.patientId) ?? { name: a.patientName, times: new Set<string>(), sexe: (a as any).sexe };
      if (!byPatient.has(a.patientId)) byPatient.set(a.patientId, entry);
 
      const time = this.formatTimeRange(a.startTime, a.endTime);
      if (time) entry.times.add(time);
    }
 
    return Array.from(byPatient.entries()).map(([patientId, v]) => ({
      patientId,
      patientName: v.name,
      times: Array.from(v.times.values()).join(', '),
      avatarUrl: v.sexe === 'F' ? 'assets/img/patient-female.png' : 'assets/img/patient-male.png',
    }));
  }

  private formatTimeRange(startTime: string, endTime: string): string {
    const s = String(startTime ?? '').trim();
    const e = String(endTime ?? '').trim();
    if (!s && !e) return '';
    if (s && e) return `${s}-${e}`;
    return s || e;
  }

  private getPatientAvatarUrl(patientId: number): string {
    const max = 37;
    const idx = ((Math.abs(Number(patientId)) - 1) % max) + 1;
    const padded = String(idx).padStart(2, '0');
    return `/images/user/user-${padded}.jpg`;
  }

  private goToDayPatients(dateKey: DateKey): void {
    this.router.navigate(['/calendar/patients', dateKey]);
  }

  private requestCalendarRerender(): void {
    // FullCalendar won't re-run dayCellDidMount for existing cells unless re-rendered.
    setTimeout(() => {
      try {
        this.calendarComponent?.getApi().render();
      } catch {
        // ignore
      }
    }, 0);
  }

  private toDateKey(value: unknown): DateKey | null {
    if (value == null) return null;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    const raw = String(value);
    if (!raw) return null;

    // Handle "1970-01-01T11:00:00" etc.
    const dateMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) return dateMatch[1];

    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return null;
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private extractTime(value: unknown): string {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    
    // Handle "1970-01-01T11:00:00" or "11:00:00"
    const match = raw.match(/(?:T|\s|^)(\d{2}:\d{2}(?::\d{2})?)/);
    return match ? match[1] : raw.slice(0, 8);
  }

  private renderEventContent(arg: any): any {
    const { patientName, sexe } = arg.event.extendedProps;
    const avatarUrl = sexe === 'F' ? 'assets/img/patient-female.png' : 'assets/img/patient-male.png';
    const isShort = arg.view.type === 'dayGridMonth';

    if (isShort) {
       return {
         html: `
           <div class="flex items-center gap-1 overflow-hidden px-1 py-0.5">
             <img src="${avatarUrl}" class="h-3 w-3 rounded-full object-cover shrink-0" />
             <span class="truncate text-[10px]">${patientName}</span>
           </div>
         `
       };
    }

    return {
      html: `
        <div class="flex items-center gap-1.5 p-1 h-full w-full overflow-hidden">
          <img src="${avatarUrl}" class="h-5 w-5 rounded-full object-cover ring-1 ring-white/10 shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="truncate text-[11px] font-semibold text-white">${patientName}</div>
            <div class="truncate text-[9px] opacity-80 text-white">${arg.timeText}</div>
          </div>
        </div>
      `
    };
  }
}
