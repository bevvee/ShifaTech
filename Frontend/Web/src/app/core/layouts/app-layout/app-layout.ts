import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../../ui/sidebar/sidebar';
import { SIDEBAR_ITEMS, SidebarItem } from '../../ui/sidebar/sidebar.config';
import { TopbarComponent } from '../../ui/topbar/topbar';

@Component({
  selector: 'st-app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './app-layout.html',
})
export class AppLayoutComponent {
  private router = inject(Router);


  activeRoute = this.router.url;

  sidebarOpen = false;

  items: SidebarItem[] = SIDEBAR_ITEMS;

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
