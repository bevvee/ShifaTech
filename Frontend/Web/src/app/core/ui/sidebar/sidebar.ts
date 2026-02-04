import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type NavChild = { label: string; route: string };
export type NavItem =
  | { label: string; icon?: string; route: string }
  | { label: string; icon?: string; children: NavChild[] };

@Component({
  selector: 'st-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  @Input({ required: false }) clinicName = '';
  @Input({ required: false }) clinicCity = '';
  @Input({ required: true }) items: NavItem[] = [];
  @Input() activeRoute = '';

  openKey: string | null = null;

  isGroup(item: NavItem): item is Extract<NavItem, { children: NavChild[] }> {
    return 'children' in item;
  }

  toggleGroup(label: string) {
    this.openKey = this.openKey === label ? null : label;
  }

  isChildActive(item: NavItem): boolean {
    if (!this.isGroup(item)) return false;
    return item.children.some(
      (c) => this.activeRoute === c.route || this.activeRoute.startsWith(c.route + '/')
    );
  }
}
