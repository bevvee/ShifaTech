import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentItem } from '../../pages/dashboard/dashboard';

@Component({
  selector: 'st-appointments-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-widget.html',
})
export class AppointmentsWidgetComponent {
  @Input({ required: true }) calendarTitle = '';
  @Input({ required: true }) weekDays: string[] = [];
  @Input({ required: true }) calendarGrid: (number | null)[] = [];
  @Input({ required: true }) selectedDay = 1;
  @Input({ required: true }) upcoming!: AppointmentItem;
}
