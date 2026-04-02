import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  clinic = 'Trustcare Clinic';
  slots: AvailabilitySlot[] = [];

  ngOnInit() {
    this.loadAvailability();
  }

  loadAvailability() {
    this.slots = [
      { day: 'Mon', time: '11:00 PM - 12:30 PM' },
      { day: 'Tue', time: '11:00 PM - 12:30 PM' },
      { day: 'Wed', time: '11:00 PM - 12:30 PM' },
      { day: 'Thu', time: '11:00 PM - 12:30 PM' },
      { day: 'Fri', time: '11:00 PM - 12:30 PM' },
      { day: 'Sat', time: '11:00 PM - 12:30 PM' },
      { day: 'Sun', time: 'Closed', isClosed: true },
    ];
  }
}
