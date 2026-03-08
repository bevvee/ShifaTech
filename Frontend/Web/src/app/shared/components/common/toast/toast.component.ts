import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { AlertComponent } from '../../ui/alert/alert.component';

@Component({
    selector: 'app-toast',
    imports: [CommonModule, AlertComponent],
    templateUrl: './toast.component.html',
    styles: [`
    @keyframes fade-in-down {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down {
      animation: fade-in-down 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
    toasts$;

    constructor(private toastService: ToastService) {
        this.toasts$ = this.toastService.toasts$;
    }
}
