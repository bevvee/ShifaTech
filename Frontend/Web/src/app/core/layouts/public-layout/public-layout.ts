import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/ui/navbar/navbar';

@Component({
  selector: 'st-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
   <!--  <st-navbar
      title="ShifaTech"
      [items]="items"
      [rightItems]="rightItems">
    </st-navbar> -->

    <main class="p-6">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class PublicLayoutComponent {
/*   items: NavItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Services', route: '/services' },
    { label: 'Contact', route: '/contact' },
  ];
  rightItems: NavItem[] = [
    { label: 'Login', route: '/auth/login' },
  ]; */
}
