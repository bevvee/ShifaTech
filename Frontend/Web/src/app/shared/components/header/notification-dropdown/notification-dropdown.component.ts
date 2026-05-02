import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Notification, TypeNotif } from '../../../../core/models/notification.model';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemComponent]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  isOpen = false;
  notifications: Notification[] = [];
  loading = false;
  hasNew = false;
  private idUser?: number;
  private stompClient?: Client;

  get notifying(): boolean {
    return this.hasNew;
  }

  ngOnInit() {
    const payload = this.authService.decodeToken() as any;
    this.idUser = Number(payload?.userId ?? payload?.id ?? payload?.idUser ?? payload?.sub);
    if (!this.idUser) return;

    // 1. Charger les notifs existantes
    this.loadNotifications();

    this.connectWebSocket();
  }

  ngOnDestroy() {
    this.stompClient?.deactivate();
  }

  private connectWebSocket() {
      import('sockjs-client').then(({ default: SockJS }) => {
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
          this.stompClient?.subscribe(
            `/topic/notifications/${this.idUser}`,
            (message) => {
              const notif: Notification = JSON.parse(message.body);
              this.notifications = [notif, ...this.notifications];
              this.hasNew = true;
            }
          );
        }
      });
      this.stompClient.activate();
    });
  }

  loadNotifications() {
    if (!this.idUser) return;
    this.loading = true;
    this.notificationService.getNotifications(this.idUser).subscribe({
      next: (data) => {
        this.notifications = data;
        this.hasNew = data.some((n: Notification) => !n.estLu);
        this.loading = false;
      },
      error: (err) => {
        console.error('erreur notif:', err);
        this.loading = false;
      }
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen && this.hasNew && this.idUser) {
      this.notificationService.markAsRead(this.idUser).subscribe();
      this.hasNew = false;
      this.notifications = this.notifications.map(n => ({ ...n, estLu: true }));
    }
  }

  closeDropdown() {
    this.isOpen = false;
    if (this.hasNew && this.idUser) {
      this.notificationService.markAsRead(this.idUser).subscribe();
      this.hasNew = false;
      this.notifications = this.notifications.map(n => ({ ...n, estLu: true }));
    }
  }

  getDate(notif: Notification): string {
    return notif.dateEnvoi ?? notif.date ?? '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
    const diff = Math.floor((Date.now() - new Date(utcStr).getTime()) / 60000);
    if (diff < 1) return "à l'instant";
    if (diff < 60) return `il y a ${diff} min`;
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }


  getTypeBadgeClass(type: TypeNotif): string {
    switch (type) {
      case 'RAPPEL':       return 'text-amber-500 font-medium';
      case 'RDV':          return 'text-blue-500 font-medium';
      case 'CONFIRMATION': return 'text-green-500 font-medium';
      case 'MODIFICATION': return 'text-purple-500 font-medium';
      case 'INFO':         return 'text-gray-400 font-medium';
      default:             return 'text-orange-400 font-medium';
    }
  }
}