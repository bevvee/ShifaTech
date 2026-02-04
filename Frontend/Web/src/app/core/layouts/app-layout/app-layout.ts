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

  items: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' },
    { label: 'Applications', icon: 'apps', route: '/app/apps' },
    { label: 'Layouts', icon: 'view_quilt', route: '/app/layouts' },

    {
      label: 'Clinic',
      icon: 'local_hospital',
      children: [
        { label: 'Doctors', route: '/app/doctors' },
        { label: 'Patients', route: '/app/patients' },
        { label: 'Appointments', route: '/app/appointments' },
        { label: 'Locations', route: '/app/locations' },
        { label: 'Services', route: '/app/services' },
        { label: 'Specializations', route: '/app/specializations' },
      ],
    },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => (this.activeRoute = e.urlAfterRedirects));
  }
}
