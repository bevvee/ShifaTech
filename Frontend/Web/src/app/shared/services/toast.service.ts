import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

    show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration = 5000) {
        const id = Date.now();
        const toast: Toast = { id, type, title, message };
        this.toasts.push(toast);
        this.toastsSubject.next([...this.toasts]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
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
