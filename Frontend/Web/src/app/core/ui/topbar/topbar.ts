import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Icon } from '../../../shared/ui/icons/Icon';


@Component({
  selector: 'st-topbar',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './topbar.html',
})
export class TopbarComponent {
  private router = inject(Router);

  @ViewChild('root', { static: true }) rootRef!: ElementRef<HTMLElement>;

  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() showNotifications = true;

  @Input() userName = 'Admin';
  @Input() userRole = 'Administrator';

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();

  mobileSearchOpen = false;
  profileOpen = false;
  notificationsOpen = false;

  searchValue = '';
  currentUrl = '';

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => (this.currentUrl = e.urlAfterRedirects));
  }





  get initials(): string {
    const parts = (this.userName || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    const first = parts[0]?.[0] ?? '';
    const second = (parts[1]?.[0] ?? parts[0]?.[1] ?? '');
    return (first + second).toUpperCase();
  }

  onSearchInput(v: string) {
    this.searchValue = v;
    this.searchChange.emit(v);
  }

  clearSearch() {
    this.onSearchInput('');
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
    if (this.profileOpen) {
      this.notificationsOpen = false;
      this.mobileSearchOpen = false;
    }
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.profileOpen = false;
      this.mobileSearchOpen = false;
    }
  }

  closeAllMenus() {
    this.profileOpen = false;
    this.notificationsOpen = false;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocMouseDown(e: MouseEvent) {
    const root = this.rootRef?.nativeElement;
    if (!root) return;
    if (!root.contains(e.target as Node)) this.closeAllMenus();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeAllMenus();
    this.mobileSearchOpen = false;
  }
}
