import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';

interface AppointmentStat {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-appointment-statistics',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './appointment-statistics.component.html',
})
export class AppointmentStatisticsComponent implements OnInit {
  readonly series: ApexNonAxisChartSeries = [260, 21, 50];
  readonly labels: string[] = ['Completed', 'Pending', 'Cancelled'];
  readonly colors: string[] = ['#10b981', '#f59e0b', '#ef4444'];

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

  stats: AppointmentStat[] = [
    { label: 'Completed', value: 260, color: '#10b981' },
    { label: 'Pending', value: 21, color: '#f59e0b' },
    { label: 'Cancelled', value: 50, color: '#ef4444' },
  ];

  ngOnInit() {
  }
}
