import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { DoctorService } from '../../../../core/services/doctor.service';
import { Doctor } from '../../../../core/models/doctor.model';
import { selectAuthUser, selectUserProfile } from '../../../../core/store/auth/auth.selectors';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

interface Patient {
  id: number;
  name: string;
  phone: string;
  appointments: number;
  avatar: string;
}

@Component({
  selector: 'app-top-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-patients.component.html',
})
export class TopPatientsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly doctorService = inject(DoctorService);

  patients: Patient[] = [];

  ngOnInit() {
    this.loadTopPatients();
  }

  loadTopPatients() {
    this.doctorService.getDoctors().pipe(
      switchMap((doctors: Doctor[]) => {
        return forkJoin({
          profile: this.store.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
          user: this.store.select(selectAuthUser).pipe(take(1), catchError(() => of(null))),
          myPatients: this.doctorService.getMyPatients().pipe(catchError(() => of([])))
        }).pipe(
          map(({ profile, user, myPatients }) => {
            const rawUserId = (profile as any)?.idUser ?? (profile as any)?.id_user ?? (profile as any)?.userId ?? (profile as any)?.id ??
                              (user as any)?.idUser ?? (user as any)?.id_user ?? (user as any)?.userId ?? (user as any)?.id ?? null;
            const userId = rawUserId != null ? Number(rawUserId) : null;
            const match = doctors.find((d: Doctor) => Number(d.idUser) === Number(userId));
            const doctorId = match?.idDocteur ?? userId;

            const patientLookup = new Map<number, any>();
            myPatients.forEach((p: any) => {
              patientLookup.set(Number(p.idPatient ?? p.id), p);
            });

            return { doctorId, patientLookup };
          }),
          switchMap(({ doctorId, patientLookup }) => {
            if (!doctorId) return of({ items: [], patientLookup });
            // Use proxy from doctor-service
            return this.doctorService.getMyAppointments().pipe(
              map(res => ({ items: (res.data || res), patientLookup })),
              catchError(() => of({ items: [], patientLookup }))
            );
          })
        );
      })
    ).subscribe(({ items, patientLookup }: { items: any[], patientLookup: Map<number, any> }) => {
      const patientCounts = new Map<number, { name: string; count: number; phone: string }>();
      
      for (const it of items) {
        const pid = Number(it.idPatient ?? it.id_patient ?? it.patientId);
        if (Number.isNaN(pid)) continue;
        
        const p = patientLookup.get(pid);
        const name = p ? `${p.prenom ?? ''} ${p.nom ?? ''}`.trim() : (`Patient #${pid}`);
        const phone = p ? (p.telephone ?? '') : (it.patient?.telephone ?? '');

        const pInfo = patientCounts.get(pid) || { 
          name: name, 
          count: 0,
          phone: phone
        };
        pInfo.count++;
        patientCounts.set(pid, pInfo);
      }

      this.patients = Array.from(patientCounts.entries())
        .map(([id, info]) => ({
          id,
          name: info.name,
          phone: info.phone,
          appointments: info.count,
          avatar: info.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }))
        .sort((a, b) => b.appointments - a.appointments)
        .slice(0, 5);
    });
  }

  getAvatarColor(index: number): string {
    const colors = [
      'bg-blue-500',
      'bg-pink-500',
      'bg-purple-500',
      'bg-indigo-500',
      'bg-gray-500',
    ];
    return colors[index % colors.length];
  }
}
