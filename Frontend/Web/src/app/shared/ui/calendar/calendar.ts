import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Appointment = {
  day: number;
  patientAvatar: string;
};

@Component({
  selector: 'st-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
})
export class CalendarComponent {

  month = 'January 2024';

  mobileMenuOpen = false;

  days = [
    27,28,29,30,31,1,2,
    3,4,5,6,7,8,9,
    10,11,12,13,14,15,16,
    17,18,19,20,21,22,23,
    24,25,26,27,28,29,30,
    31,1,2,3,4,5,6
  ];

  // 🔥 Simulated patient appointments
  appointments: Appointment[] = [
    { day: 3, patientAvatar: 'https://i.pravatar.cc/40?img=1' },
    { day: 3, patientAvatar: 'https://i.pravatar.cc/40?img=2' },
    { day: 3, patientAvatar: 'https://i.pravatar.cc/40?img=3' },
    { day: 3, patientAvatar: 'https://i.pravatar.cc/40?img=4' },
    { day: 3, patientAvatar: 'https://i.pravatar.cc/40?img=5' },

    { day: 12, patientAvatar: 'https://i.pravatar.cc/40?img=6' },
    { day: 12, patientAvatar: 'https://i.pravatar.cc/40?img=7' },

    { day: 19, patientAvatar: 'https://i.pravatar.cc/40?img=8' },
  ];

  getAppointmentsForDay(day: number) {
    return this.appointments.filter(a => a.day === day);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
