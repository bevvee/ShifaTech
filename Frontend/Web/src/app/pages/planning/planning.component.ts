import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { Store } from '@ngrx/store';
import { combineLatest, forkJoin, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';

import { selectAuthUser, selectUserProfile, selectUserRole } from '../../core/store/auth/auth.selectors';
import { Role } from '../../core/models/role.enum';
import { DoctorService } from '../../core/services/doctor.service';
import { PlanningService } from '../../core/services/planning.service';
import { PlanningDto } from '../../core/models/planning.model';
import { Doctor } from '../../core/models/doctor.model';

@Component({
  selector: 'app-planning',
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent, ComponentCardComponent],
  templateUrl: './planning.component.html',
})
export class PlanningComponent {
  private readonly store = inject(Store);
  private readonly doctorService = inject(DoctorService);
  private readonly planningService = inject(PlanningService);

  role: Role | null = null;
  isAuthReady = false;

  isLoading = false;
  isSaving = false;
  errorMessage = '';

  doctorId: number | null = null; // doctor table idDocteur
  doctors: Doctor[] = [];
  selectedDoctorId: number | null = null;

  readonly days: Array<{ key: DayKey; label: string }> = [
    { key: 'MONDAY', label: 'Monday' },
    { key: 'TUESDAY', label: 'Tuesday' },
    { key: 'WEDNESDAY', label: 'Wednesday' },
    { key: 'THURSDAY', label: 'Thursday' },
    { key: 'FRIDAY', label: 'Friday' },
    { key: 'SATURDAY', label: 'Saturday' },
    { key: 'SUNDAY', label: 'Sunday' },
  ];

  activeDay: DayKey = 'MONDAY';

  activeForm: PlanningForm = this.emptyForm(this.activeDay);

  get isDoctor(): boolean {
    return String(this.role ?? '').toUpperCase() === 'DOCTEUR';
  }
  get isInfirmier(): boolean {
    return String(this.role ?? '').toUpperCase() === 'INFIRMIER';
  }

  get isFormDisabled(): boolean {
    return !this.isAuthReady || !this.isDoctor || this.isLoading || this.isSaving;
  }

  get activeDayLabel(): string {
    return this.days.find((d) => d.key === this.activeDay)?.label ?? this.activeDay;
  }

  // One slot per day for now (matches the requested DB columns).
  formByDay: Record<DayKey, PlanningForm> = {
    MONDAY: this.emptyForm('MONDAY'),
    TUESDAY: this.emptyForm('TUESDAY'),
    WEDNESDAY: this.emptyForm('WEDNESDAY'),
    THURSDAY: this.emptyForm('THURSDAY'),
    FRIDAY: this.emptyForm('FRIDAY'),
    SATURDAY: this.emptyForm('SATURDAY'),
    SUNDAY: this.emptyForm('SUNDAY'),
  };

  ngOnInit() {
    this.activeForm = this.formByDay[this.activeDay];
    this.load();
  }

  setActiveDay(day: DayKey) {
    this.activeDay = day;
    this.activeForm = this.formByDay[day];
  }

  cancel() {
    this.load();
  }
    onDoctorChange(doctorId: number) {
      this.selectedDoctorId = doctorId;
      if (doctorId) {
        this.isLoading = true;
        this.planningService.getByDoctor(doctorId).pipe(
          catchError(() => of([] as PlanningDto[]))
        ).subscribe(plans => {
          for (const d of this.days) {
            this.formByDay[d.key] = this.emptyForm(d.key);
          }
          for (const p of plans ?? []) {
            const dayKey = this.normalizeDayKey((p as any).jour);
            if (!dayKey) continue;
            this.formByDay[dayKey] = {
              idPlan: (p as any).idPlan ?? undefined,
              jour: dayKey,
              heureDebut: this.toHHmm((p as any).heureDebut),
              heureFin: this.toHHmm((p as any).heureFin),
              pauseDebut: this.toHHmm((p as any).pauseDebut),
              pauseFin: this.toHHmm((p as any).pauseFin),
            };
          }
          this.activeForm = this.formByDay[this.activeDay];
          this.isLoading = false;
        });
      }
    }
  saveChanges() {
    if (this.role !== Role.DOCTEUR) return;
    if (this.doctorId == null) return;

    this.isSaving = true;
    this.errorMessage = '';

    const upserts = this.days
      .map((d) => this.formByDay[d.key])
      .filter((f) => this.shouldPersist(f))
      .map((f) => this.toDto(f, this.doctorId as number));

    // Minimal behavior: save all filled days; do not delete missing days.
    forkJoin(
      upserts.map((dto) => {
        const idPlan = dto.idPlan;
        if (idPlan != null) {
          return this.planningService.update(idPlan, dto).pipe(catchError((err) => of({ __error: err } as any)));
        }
        return this.planningService.create(dto).pipe(catchError((err) => of({ __error: err } as any)));
      })
    )
      .pipe(take(1))
      .subscribe({
        next: (results: any[]) => {
          const hasError = results.some((r) => r && (r as any).__error);
          if (hasError) {
            this.errorMessage = 'Some slots failed to save. Please try again.';
          }
          this.isSaving = false;
          this.load();
        },
        error: () => {
          this.isSaving = false;
          this.errorMessage = 'Failed to save planning.';
        },
      });
  }

  private load() {
    this.isLoading = true;
    this.errorMessage = '';
    this.isAuthReady = false;
    this.doctorId = null;
    this.doctors = this.doctors;

    const auth$ = combineLatest({
      role: this.store.select(selectUserRole).pipe(catchError(() => of(null))),
      user: this.store.select(selectAuthUser).pipe(catchError(() => of(null))),
      profile: this.store.select(selectUserProfile).pipe(catchError(() => of(null))),
    }).pipe(
      filter(({ user, profile }) => user != null || profile != null),
      take(1)
    );

    forkJoin({
      auth: auth$,
      doctors: this.doctorService.getDoctors().pipe(catchError(() => of([] as Doctor[]))),
    })
      .pipe(
        map(({ auth, doctors }) => {
          this.role = auth.role;
          this.isAuthReady = true;
          this.doctors = doctors;

          const userId = this.getAuthUserId(auth.user, auth.profile);
          const doctorId = this.resolveDoctorId(userId, doctors);
          return { doctorId, isDoctor: this.isDoctor };
        }),
        switchMap(({ doctorId, isDoctor }) => {
          if (this.isInfirmier) return of([] as PlanningDto[]);
          if (!isDoctor) return of([] as PlanningDto[]);
          if (doctorId == null) return of([] as PlanningDto[]);
          this.doctorId = doctorId;
          return this.planningService.getByDoctor(doctorId).pipe(catchError(() => of([] as PlanningDto[])));
        })
      )
      .subscribe({
        next: (plans) => {
          // reset
          for (const d of this.days) {
            this.formByDay[d.key] = this.emptyForm(d.key);
          }

          for (const p of plans ?? []) {
            const dayKey = this.normalizeDayKey((p as any).jour);
            if (!dayKey) continue;
            this.formByDay[dayKey] = {
              idPlan: (p as any).idPlan ?? undefined,
              jour: dayKey,
              heureDebut: this.toHHmm((p as any).heureDebut),
              heureFin: this.toHHmm((p as any).heureFin),
              pauseDebut: this.toHHmm((p as any).pauseDebut),
              pauseFin: this.toHHmm((p as any).pauseFin),
            };
          }

          this.activeForm = this.formByDay[this.activeDay];

          if (this.isDoctor && this.doctorId == null) {
            this.errorMessage = 'No doctor profile found for this account.';
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load planning.';
        },
      });
  }

  private emptyForm(day: DayKey): PlanningForm {
    return {
      jour: day,
      heureDebut: '',
      heureFin: '',
      pauseDebut: '',
      pauseFin: '',
    };
  }

  private shouldPersist(form: PlanningForm): boolean {
    return Boolean(form.heureDebut && form.heureFin);
  }

  private toDto(form: PlanningForm, doctorId: number): PlanningDto {
    return {
      idPlan: form.idPlan,
      idDoctor: doctorId,
      jour: form.jour,
      heureDebut: this.toLocalTimePayload(form.heureDebut),
      heureFin: this.toLocalTimePayload(form.heureFin),
      pauseDebut: form.pauseDebut ? this.toLocalTimePayload(form.pauseDebut) : null,
      pauseFin: form.pauseFin ? this.toLocalTimePayload(form.pauseFin) : null,
    };
  }

  private toLocalTimePayload(hhmm: string): string | null {
    const t = String(hhmm ?? '').trim();
    if (!t) return null;
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
    if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
    return t;
  }

  private toHHmm(value: unknown): string {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
    return raw;
  }

  private getAuthUserId(user: any, profile: any): number | null {
    const raw =
      profile?.idUser ??
      profile?.id_user ??
      profile?.userId ??
      profile?.id ??
      user?.idUser ??
      user?.id_user ??
      user?.userId ??
      user?.id ??
      null;
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private resolveDoctorId(profileUserId: number | null, doctors: Doctor[]): number | null {
    if (profileUserId == null) return null;
    const match = (doctors ?? []).find((d) => Number((d as any).idUser) === Number(profileUserId));
    return (match as any)?.idDocteur != null ? Number((match as any).idDocteur) : null;
  }

  private normalizeDayKey(value: unknown): DayKey | null {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const s = raw.toUpperCase();

    const map: Record<string, DayKey> = {
      MONDAY: 'MONDAY', LUNDI: 'MONDAY',
      TUESDAY: 'TUESDAY', MARDI: 'TUESDAY',
      WEDNESDAY: 'WEDNESDAY', MERCREDI: 'WEDNESDAY',
      THURSDAY: 'THURSDAY', JEUDI: 'THURSDAY',
      FRIDAY: 'FRIDAY', VENDREDI: 'FRIDAY',
      SATURDAY: 'SATURDAY', SAMEDI: 'SATURDAY',
      SUNDAY: 'SUNDAY', DIMANCHE: 'SUNDAY',
    };

    return map[s] ?? null;
  }
}

type DayKey = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

type PlanningForm = {
  idPlan?: number;
  jour: DayKey;
  heureDebut: string; // HH:mm
  heureFin: string; // HH:mm
  pauseDebut: string; // HH:mm
  pauseFin: string; // HH:mm
};
