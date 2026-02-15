import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'st-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
   <!--  <st-navbar
      title="ShifaTech"
      [items]="items"
      [rightItems]="rightItems">
    </st-navbar> -->

    <main>
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
