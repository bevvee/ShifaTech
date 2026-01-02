import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

export type SideLink = {
  label: string;
  route: string;
  icon?: string;
};

export type SideGroup = {
  type: 'group';
  label: string;
  icon: string;
  children: SideLink[];
};

export type SideItem = SideLink | SideGroup;

@Component({
  selector: 'st-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],

})
export class SidebarComponent {
  @Input({ required: true }) items: SideItem[] = [];

  openKey: string | null = null;

  constructor(private router: Router) {}

  isGroup(item: SideItem): item is SideGroup {
    return (item as any).type === 'group';
  }

  toggleGroup(label: string) {
    this.openKey = this.openKey === label ? null : label;
  }

  isChildActive(group: SideGroup): boolean {
    const url = this.router.url;
    return group.children.some(c => url.startsWith(c.route));
  }
}
