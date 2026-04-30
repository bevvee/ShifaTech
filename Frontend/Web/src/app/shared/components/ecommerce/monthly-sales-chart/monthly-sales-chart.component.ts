
import { Component, OnInit, inject } from '@angular/core';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexPlotOptions, ApexDataLabels, ApexStroke, ApexLegend, ApexYAxis, ApexGrid, ApexFill, ApexTooltip } from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { RdvService } from '../../../../core/services/rdv.service';
import { RdvStatut } from '../../../../core/models/rdv-statut.enum';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, expand, map, reduce, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-monthly-sales-chart',
  standalone: true,
  imports: [
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './monthly-sales-chart.component.html'
})
export class MonthlySalesChartComponent implements OnInit {
  private readonly rdvService = inject(RdvService);

  private readonly currentYear = new Date().getFullYear();

  selectedStatut: 'ALL' | RdvStatut = RdvStatut.TERMINE;
  title = 'Monthly RDVs (Terminé)';
  readonly RdvStatut = RdvStatut;

  public series: ApexAxisChartSeries = [
    {
      name: 'RDVs (Terminé)',
      data: Array.from({ length: 12 }, () => 0),
    },
  ];
  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 180,
    toolbar: { show: false },
  };
  public xaxis: ApexXAxis = {
    categories: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '39%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  };
  public dataLabels: ApexDataLabels = { enabled: false };
  public stroke: ApexStroke = {
    show: true,
    width: 4,
    colors: ['transparent'],
  };
  public legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
  };
  public yaxis: ApexYAxis = { title: { text: undefined } };
  public grid: ApexGrid = { yaxis: { lines: { show: true } } };
  public fill: ApexFill = { opacity: 1 };
  public tooltip: ApexTooltip = {
    x: { show: false },
    y: { formatter: (val: number) => `${val}` },
  };
  public colors: string[] = ['#465fff'];

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  ngOnInit(): void {
    this.refreshChart();
  }

  selectStatut(statut: 'ALL' | RdvStatut): void {
    this.selectedStatut = statut;
    this.closeDropdown();
    this.refreshChart();
  }

  getSelectedStatutLabel(statut: 'ALL' | RdvStatut = this.selectedStatut): string {
    if (statut === 'ALL') return 'Tous';
    switch (statut) {
      case RdvStatut.EN_ATTENTE:
        return 'En attente';
      case RdvStatut.CONFIRME:
        return 'Confirmé';
      case RdvStatut.ANNULE:
        return 'Annulé';
      case RdvStatut.TERMINE:
        return 'Terminé';
      default:
        return String(statut);
    }
  }

  private refreshChart(): void {
    const selected = this.selectedStatut;
    const selectedLabel = this.getSelectedStatutLabel(selected);

    this.title = `Monthly RDVs (${selectedLabel})`;

    const params: Record<string, string | number | boolean | null | undefined> =
      selected === 'ALL' ? {} : { statut: selected };

    this.fetchAllRdvs(params).pipe(
      map((rdvs) => {
        if (selected === 'ALL') return rdvs;
        return (rdvs ?? []).filter((r) => this.matchesStatut((r as any)?.statut, selected));
      }),
      catchError(() => of([] as any[])),
    ).subscribe((rdvs) => {
      const data = this.aggregateMonthlyRdvs(rdvs, this.currentYear);
      const seriesName = `RDVs (${selectedLabel})`;
      this.series = [{ name: seriesName, data }];
    });
  }

  private fetchAllRdvs(params: Record<string, string | number | boolean | null | undefined>): Observable<any[]> {
    const maxPages = 100;

    type PageState = { page: number; res: any; nextPage: number | null };

    const fetchFirst = () =>
      this.rdvService.getAll({ ...params }).pipe(
        map((res) => ({ page: 1, res, nextPage: this.extractNextPage(res) } as PageState)),
        catchError(() => of({ page: 1, res: [] as any, nextPage: null } as PageState)),
      );

    const fetchPage = (page: number) =>
      this.rdvService.getAll({ ...params, page }).pipe(
        map((res) => ({ page, res, nextPage: this.extractNextPage(res) } as PageState)),
        catchError(() => of({ page, res: [] as any, nextPage: null } as PageState)),
      );

    return fetchFirst().pipe(
      expand((state) => {
        if (!state.nextPage) return EMPTY;
        if (state.nextPage <= state.page) return EMPTY;
        if (state.nextPage > maxPages) return EMPTY;
        return fetchPage(state.nextPage);
      }),
      map((state) => this.extractRdvArray(state.res)),
      reduce((acc, items) => acc.concat(items), [] as any[]),
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

  private extractNextPage(res: any): number | null {
    if (!res || typeof res !== 'object') return null;

    const nextUrl =
      (res as any)?.view?.next ??
      (res as any)?.['hydra:view']?.['hydra:next'] ??
      null;
    if (!nextUrl) return null;

    const s = String(nextUrl);
    const match = /(?:\?|&)page=(\d+)/.exec(s);
    if (!match) return null;
    const n = Number(match[1]);
    return Number.isFinite(n) ? n : null;
  }

  private isTermineStatus(statut: unknown): boolean {
    const s = String(statut ?? '').trim().toUpperCase();
    return s === RdvStatut.TERMINE || s === 'TERMINÉ' || s === 'TERMINE';
  }

  private matchesStatut(statut: unknown, expected: RdvStatut): boolean {
    const s = String(statut ?? '').trim().toUpperCase();
    if (expected === RdvStatut.TERMINE) return this.isTermineStatus(s);
    return s === expected;
  }

  private aggregateMonthlyRdvs(rdvs: any[], year: number): number[] {
    const counts = Array.from({ length: 12 }, () => 0);

    for (const rdv of rdvs ?? []) {
      const rdvDate = this.parseDateOnly((rdv as any)?.date_rdv);
      if (!rdvDate) continue;
      if (rdvDate.getFullYear() !== year) continue;

      const monthIndex = rdvDate.getMonth();
      if (monthIndex < 0 || monthIndex > 11) continue;

      counts[monthIndex] += 1;
    }

    return counts;
  }

  private parseDateOnly(value: unknown): Date | null {
    if (!value) return null;
    const str = String(value).trim();
    // Expected formats: YYYY-MM-DD or ISO string
    const match = /^\s*(\d{4})-(\d{2})-(\d{2})/.exec(str);
    if (!match) {
      const d = new Date(str);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    return new Date(year, month - 1, day);
  }
}