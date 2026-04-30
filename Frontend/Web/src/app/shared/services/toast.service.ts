import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from '../../core/services/alert.service';

export interface Toast {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts: Toast[] = [];
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    toasts$ = this.toastsSubject.asObservable();

    constructor(private readonly alerts: AlertService) {}

    show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration = 5000) {
        void duration;
        void this.alerts.toast(type, title, message);
    }

    success(title: string, message: string) {
        this.show('success', title, message);
    }

    error(title: string, message: string) {
        this.show('error', title, message);
    }

    remove(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
        this.toastsSubject.next([...this.toasts]);
    }
}
