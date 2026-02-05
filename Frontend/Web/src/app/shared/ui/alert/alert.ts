import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'st-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrls: ['./alert.css'],
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'info';
  @Input() title = 'Information';
  @Input() message = '';
  @Input() closable = true;

  /** Use if you want to control visibility from parent */
  @Output() closed = new EventEmitter<void>();

  get boxClasses(): string {
    // soft tinted background like screenshot
    switch (this.variant) {
      case 'success':
        return 'bg-emerald-50/60';
      case 'warning':
        return 'bg-amber-50/70';
      case 'error':
        return 'bg-rose-50/60';
      default:
        return 'bg-sky-50/60';
    }
  }

  get ringClasses(): string {
    // subtle border + shadow
    return 'border border-slate-200 shadow-[0_14px_35px_rgba(2,6,23,0.10)]';
  }

  get iconWrapClasses(): string {
    // left rounded icon background (white) + tinted ring
    switch (this.variant) {
      case 'success':
        return 'bg-white ring-1 ring-emerald-200 text-emerald-600';
      case 'warning':
        return 'bg-white ring-1 ring-amber-200 text-amber-600';
      case 'error':
        return 'bg-white ring-1 ring-rose-200 text-rose-600';
      default:
        return 'bg-white ring-1 ring-sky-200 text-sky-600';
    }
  }

  close() {
    this.closed.emit();
  }
}
