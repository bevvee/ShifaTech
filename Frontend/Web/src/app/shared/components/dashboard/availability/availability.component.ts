import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { PlanningService } from '../../../../core/services/planning.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { Doctor } from '../../../../core/models/doctor.model';
import { selectAuthUser, selectUserProfile } from '../../../../core/store/auth/auth.selectors';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

interface AvailabilitySlot {
  day: string;
  time: string;
  isClosed?: boolean;
}

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './availability.component.html',
})
export class AvailabilityComponent implements OnInit {
  private readonly planningService = inject(PlanningService);
  private readonly doctorService = inject(DoctorService);
  private readonly store = inject(Store);

  clinic = 'Trustcare Clinic';
  slots: AvailabilitySlot[] = [];

  ngOnInit() {
    this.loadAvailability();
  }

  loadAvailability() {
    this.doctorService.getDoctors().pipe(
      switchMap((doctors: Doctor[]) => {
        return forkJoin({
          profile: this.store.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
          user: this.store.select(selectAuthUser).pipe(take(1), catchError(() => of(null)))
        }).pipe(
          map(({ profile, user }) => {
            const rawUserId = (profile as any)?.idUser ?? (profile as any)?.id_user ?? (profile as any)?.userId ?? (profile as any)?.id ??
                              (user as any)?.idUser ?? (user as any)?.id_user ?? (user as any)?.userId ?? (user as any)?.id ?? null;
            const userId = rawUserId != null ? Number(rawUserId) : null;
            const match = doctors.find((d: Doctor) => Number(d.idUser) === Number(userId));
            return (match?.idDocteur ?? userId) as number | null;
          }),
          switchMap((doctorId) => {
            if (!doctorId) return of([] as any[]);
            return this.planningService.getByDoctor(Number(doctorId)).pipe(
              catchError(() => of([] as any[]))
            );
          })
        );
      })
    ).subscribe((plans: any[]) => {
      if (plans.length > 0) {
        // Map backend planning to slots
        const dayMap: Record<string, string> = {
          'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed', 'THURSDAY': 'Thu', 'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
        };
        
        this.slots = plans.map(p => {
          const dayVal = (p.jour || p.jourSemaine || '').toUpperCase();
          return {
            day: dayMap[dayVal] || dayVal || 'Unknown',
            time: `${(p.heureDebut || '').slice(0, 5)} - ${(p.heureFin || '').slice(0, 5)}`,
            isClosed: false
          };
        });

        // Fill missing days as closed
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach(d => {
          if (!this.slots.find(s => s.day === d)) {
            this.slots.push({ day: d, time: 'Closed', isClosed: true });
          }
        });
        
        // Sort by day
        this.slots.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));
      } else {
        // Fallback or empty
        this.slots = [
          { day: 'Mon', time: 'Closed', isClosed: true },
          { day: 'Tue', time: 'Closed', isClosed: true },
          { day: 'Wed', time: 'Closed', isClosed: true },
          { day: 'Thu', time: 'Closed', isClosed: true },
          { day: 'Fri', time: 'Closed', isClosed: true },
          { day: 'Sat', time: 'Closed', isClosed: true },
          { day: 'Sun', time: 'Closed', isClosed: true },
        ];
      }
    });
  }
}
