import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent, NavItem } from '../../ui/sidebar/sidebar';
import { TopbarComponent } from '../../ui/topbar/topbar';

@Component({
  selector: 'st-app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './app-layout.html',
})
export class AppLayoutComponent {
  private router = inject(Router);

  clinicName = 'Trustcare Clinic';
  clinicCity = 'Lasvegas';

  activeRoute = this.router.url;

  sidebarOpen = false;

  items: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' },

    { label: 'Doctors', icon: 'medical_services', route: '/app/doctors' },
    { label: 'Patients', icon: 'groups', route: '/app/patients' },
    { label: 'Appointments', icon: 'event', route: '/app/appointments' },
    { label: 'Locations', icon: 'location_on', route: '/app/locations' },
    { label: 'Services', icon: 'miscellaneous_services', route: '/app/services' },
    { label: 'Specializations', icon: 'category', route: '/app/specializations' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.activeRoute = e.urlAfterRedirects;
        this.sidebarOpen = false;
      });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
