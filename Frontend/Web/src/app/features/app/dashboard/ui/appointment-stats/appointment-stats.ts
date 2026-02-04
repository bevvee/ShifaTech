import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'st-appointment-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-stats.html',
})
export class AppointmentStatsComponent {
  @Input({ required: true }) tabs: { label: string; value: string; dot: string }[] = [];
  @Input({ required: true }) months: string[] = [];
  @Input({ required: true }) bars: { completed: number; ongoing: number; rescheduled: number }[] = [];

  maxY = 5000;

  clampPct(v: number) {
    const pct = Math.round((v / this.maxY) * 100);
    return Math.max(2, Math.min(100, pct));
  }
}
