import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Notification } from '../../../../core/models/notification.model';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemComponent]
})
export class NotificationDropdownComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  isOpen = false;
  notifications: Notification[] = [];
  loading = false;
  hasNew = false; // Flag pour afficher/masquer le badge rouge au lieu de vérifier length

  get notifying(): boolean {
    return this.hasNew;
  }

  ngOnInit() {
    this.loadNotifications();
    setInterval(() => this.loadNotifications(), 2 * 60 * 1000);
  }

  loadNotifications() {
    const payload = this.authService.decodeToken() as any;
    const idUser = Number(payload?.userId ?? payload?.id ?? payload?.idUser ?? payload?.sub);

    if (!idUser) return;

    this.loading = true;
    this.notificationService.getNotifications(idUser).subscribe({
      next: (data) => {
        // 1. Les anciens rendez-vous ou notifications "lues" disparaissent car on filtre:
        this.notifications = data.filter((n: Notification) => n.estLu === false);
        this.hasNew = this.notifications.length > 0;
        this.loading = false;
      },
      error: (err) => {
        console.error(' erreur notif:', err);
        this.loading = false;
      }
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;

    // 2. Si on ouvre et qu'il y a du nouveau, on cache le point rouge et met à jour en base
    if (this.isOpen && this.hasNew) {
      const payload = this.authService.decodeToken() as any;
      const idUser = Number(payload?.userId ?? payload?.id ?? payload?.idUser ?? payload?.sub);

      if (idUser) {
        this.notificationService.markAsRead(idUser).subscribe();
        this.hasNew = false; // Fait disparaître le point rouge immédiatement !
      }
    }
  }

  closeDropdown() { this.isOpen = false; }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "à l'instant";
    if (diff < 60) return `il y a ${diff} min`;
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }
}

