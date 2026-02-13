import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardsComponent } from '../../ui/kpi-cards/kpi-cards';
import { AppointmentStatsComponent } from '../../ui/appointment-stats/appointment-stats';
import { AppointmentsWidgetComponent } from '../../ui/appointments-widget/appointments-widget';

export type Kpi = {
  title: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down';
  note: string;
  iconBg: string;
  iconColor: string;
};

export type AppointmentItem = {
  title: string;
  dateLabel: string;
  timeLabel: string;
  avatarUrl?: string;
};

@Component({
  selector: 'st-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent,
    AppointmentStatsComponent,
    AppointmentsWidgetComponent,
      CommonModule  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  kpis: Kpi[] = [
    { title: 'Doctors', value: '247', delta: '+95%', deltaType: 'up', note: 'in last 7 Days', iconBg: 'bg-indigo-600', iconColor: 'text-white' },
    { title: 'Patients', value: '4178', delta: '+25%', deltaType: 'up', note: 'in last 7 Days', iconBg: 'bg-red-500', iconColor: 'text-white' },
    { title: 'Appointment', value: '12178', delta: '-15%', deltaType: 'down', note: 'in last 7 Days', iconBg: 'bg-blue-500', iconColor: 'text-white' },
    { title: 'Revenue', value: '$55,1240', delta: '+25%', deltaType: 'up', note: 'in last 7 Days', iconBg: 'bg-emerald-500', iconColor: 'text-white' },
  ];

  statsTabs = [
    { label: 'All Appointments', value: '6314', dot: 'bg-indigo-600' },
    { label: 'Cancelled', value: '456', dot: 'bg-red-500' },
    { label: 'Reschedule', value: '745', dot: 'bg-amber-400' },
    { label: 'Completed', value: '4578', dot: 'bg-emerald-500' },
  ];

  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  bars = [
    { completed: 1200, ongoing: 900, rescheduled: 200 },
    { completed: 1500, ongoing: 1100, rescheduled: 300 },
    { completed: 2100, ongoing: 1200, rescheduled: 500 },
    { completed: 1900, ongoing: 1400, rescheduled: 600 },
    { completed: 2600, ongoing: 1700, rescheduled: 900 },
    { completed: 900, ongoing: 600, rescheduled: 250 },
    { completed: 1400, ongoing: 900, rescheduled: 350 },
    { completed: 1600, ongoing: 1100, rescheduled: 400 },
    { completed: 2800, ongoing: 1500, rescheduled: 700 },
    { completed: 2700, ongoing: 1400, rescheduled: 650 },
    { completed: 2100, ongoing: 1200, rescheduled: 500 },
    { completed: 1800, ongoing: 1000, rescheduled: 450 },
  ];

  calendarTitle = 'January 2026';
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  calendarGrid: (number | null)[] = [
    null, null, null, null, 1, 2, 3,
    4, 5, 6, 7, 8, 9, 10,
    11,12,13,14,15,16,17,
    18,19,20,21,22,23,24,
    25,26,27,28,29,30,31,
  ];

  selectedDay = 30;

  upcoming: AppointmentItem = {
    title: 'General Visit',
    dateLabel: 'Wed, 05 Apr 2025',
    timeLabel: '06:30 PM',
  };
}
