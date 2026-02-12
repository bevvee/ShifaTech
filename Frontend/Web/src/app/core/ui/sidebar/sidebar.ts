import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SidebarChild, SidebarItem } from './sidebar.config';
import { Icon } from '../../../shared/ui/icons/Icon';

@Component({
  selector: 'st-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  @Input() clinicName = 'ShifaTech';
  @Input() activeRoute = '';
  @Input({ required: true }) items: SidebarItem[] = [];

  @Output() requestClose = new EventEmitter<void>();

  openGroup: string | null = null;

  isImageIcon(icon: string | null | undefined): boolean {
    if (!icon) return false;
    return icon.includes('/') || icon.includes('\\') || icon.endsWith('.svg') || icon.startsWith('assets/');
  }

  isGroup(item: SidebarItem): item is SidebarItem & { children: SidebarChild[] } {
    return Array.isArray(item.children) && item.children.length > 0;
  }

  toggleGroup(label: string) {
    this.openGroup = this.openGroup === label ? null : label;
  }
}
