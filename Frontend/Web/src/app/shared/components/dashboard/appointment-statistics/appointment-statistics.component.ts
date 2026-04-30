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
    forkJoin({
      profile: this.store.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
      user: this.store.select(selectAuthUser).pipe(take(1), catchError(() => of(null))),
    })
      .pipe(
        map(({ profile, user }) => {
          const src = profile ?? user;
          const rawUserId =
            (src as any)?.idUser ??
            (src as any)?.id_user ??
            (src as any)?.userId ??
            (src as any)?.id ??
            null;
          const doctorUserId = rawUserId != null ? Number(rawUserId) : null;
          return doctorUserId && !Number.isNaN(doctorUserId) ? doctorUserId : null;
        }),
        switchMap((doctorUserId) => {
          if (!doctorUserId) return of(null);

          return this.rdvService
            .getRendezVousViewList({ id_docteur: doctorUserId, pagination: false, itemsPerPage: 1000 })
            .pipe(
              map((res: any) => this.extractArrayFromResponse(res)),
              catchError(() => of([] as any[])),
            );
        }),
      )
      .subscribe((items: any[] | null) => {
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
