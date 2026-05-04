import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Store } from '@ngrx/store';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { RdvService } from '../../../../core/services/rdv.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { Doctor } from '../../../../core/models/doctor.model';
import { selectAuthUser, selectUserProfile } from '../../../../core/store/auth/auth.selectors';

type RdvStatusKey = 'CONFIRME' | 'ANNULE' | 'TERMINE';

interface StatusStat {
  key: RdvStatusKey;
  label: string;
  value: number;
  dotClass: string;
}

@Component({
  selector: 'app-appointment-statistics',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './appointment-statistics.component.html',
})
export class AppointmentStatisticsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly rdvService = inject(RdvService);
  private readonly doctorService = inject(DoctorService);

  series: ApexNonAxisChartSeries = [0, 0, 0];
  labels: string[] = ['CONFIRME', 'ANNULE', 'TERMINE'];
  colors: string[] = ['#f59e0b', '#ef4444', '#10b981'];

  readonly chart: ApexChart = {
    type: 'donut',
    height: 220,
    toolbar: {
      show: false,
    },
  };

  readonly plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '70%',
      },
    },
  };

  readonly legend: ApexLegend = {
    show: false,
  };

  readonly dataLabels: ApexDataLabels = {
    enabled: false,
  };

  stats: StatusStat[] = [
    { key: 'CONFIRME', label: 'CONFIRME', value: 0, dotClass: 'bg-warning-500' },
    { key: 'ANNULE', label: 'ANNULE', value: 0, dotClass: 'bg-error-500' },
    { key: 'TERMINE', label: 'TERMINE', value: 0, dotClass: 'bg-success-500' },
  ];

  ngOnInit() {
    this.loadStats();
  }

  private loadStats(): void {
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
            if (!doctorId) return of([]);
            // Use proxy from doctor-service
            return this.doctorService.getMyAppointments().pipe(
              map((res: any) => this.extractArrayFromResponse(res.data || res)),
              catchError(() => of([] as any[]))
            );
          })
        );
      })
    ).subscribe((items: any[]) => {
        if (!items) return;
        const totals: Record<RdvStatusKey, number> = {
          TERMINE: 0,
          CONFIRME: 0,
          ANNULE: 0,
        };

        for (const it of items) {
          const status = String(it?.statut ?? it?.status ?? '').trim().toUpperCase();
          if (status === 'TERMINE' || status === 'TERMINÉ') totals.TERMINE += 1;
          else if (status === 'CONFIRME' || status === 'CONFIRMÉ') totals.CONFIRME += 1;
          else if (status === 'ANNULE' || status === 'ANNULÉ') totals.ANNULE += 1;
        }

        this.stats = this.stats.map((s) => ({ ...s, value: totals[s.key] }));
        this.series = [totals.CONFIRME, totals.ANNULE, totals.TERMINE];
      });
  }

  private extractArrayFromResponse(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res['hydra:member'])) return res['hydra:member'];
    if (res && Array.isArray(res.member)) return res.member;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  }
}
