import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'st-navbar',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  @Output() menuClick = new EventEmitter<void>();

  showNotifications = false;
  showProfile = false;

  notifications = [
    { title: 'New appointment created', time: '2m' },
    { title: 'Patient updated profile', time: '15m' },
    { title: 'Report ready to view', time: '1h' },
  ];

  constructor(private host: ElementRef<HTMLElement>) {}

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showProfile = false;
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    if (this.showProfile) this.showNotifications = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) {
      this.showNotifications = false;
      this.showProfile = false;
    }
  }
}
