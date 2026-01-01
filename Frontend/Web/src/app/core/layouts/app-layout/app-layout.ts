import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar';

// ✅ change this path to your real navbar path
import { NavbarComponent } from '../../../shared/ui/navbar/navbar';

@Component({
  selector: 'st-app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './app-layout.html',
})

export class AppLayoutComponent {
  menu = [
  { label: 'Dashboard', route: '/app/dashboard', icon: 'dashboard' },

  {
    type: 'group',
    label: 'Doctors',
    icon: 'medical_services',
    children: [
      { label: 'Doctors List', route: '/app/doctors' },
      { label: 'Add Doctor', route: '/app/doctors/add' },
      { label: 'Doctor Schedule', route: '/app/doctors/schedule' },
      { label: 'Specializations', route: '/app/specializations' },
    ],
  },

  {
    type: 'group',
    label: 'Patients',
    icon: 'person',
    children: [
      { label: 'Patients List', route: '/app/patients' },
      { label: 'Add Patient', route: '/app/patients/add' },
    ],
  },

  {
    type: 'group',
    label: 'Appointments',
    icon: 'event',
    children: [
      { label: 'Appointments List', route: '/app/appointments' },
      { label: 'Create Appointment', route: '/app/appointments/add' },
      { label: 'Calendar', route: '/app/appointments/calendar' },
    ],
  },

  {
    type: 'group',
    label: 'Spécialisation',
    icon: 'category',
    children: [
      { label: 'All Specializations', route: '/app/specializations' },
      { label: 'Add Specialization', route: '/app/specializations/add' },
    ],
  },

  {
    type: 'group',
    label: 'Services',
    icon: 'build',
    children: [
      { label: 'Services List', route: '/app/services' },
      { label: 'Add Service', route: '/app/services/add' },
    ],
  },

  { label: 'Staffs', route: '/app/staffs', icon: 'groups' },
] as any;

}
