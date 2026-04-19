import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getNotifications(idUser: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${environment.api.admin}/notifications/user/${idUser}`,
      { headers: this.headers }
    );
  }

  markAsRead(idUser: number): Observable<void> {
    return this.http.put<void>(
      `${environment.api.admin}/notifications/user/${idUser}/mark-read`,
      {},
      { headers: this.headers }
    );
  }
}
