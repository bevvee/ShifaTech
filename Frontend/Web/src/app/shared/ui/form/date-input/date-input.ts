import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

type DayCell = {
  date: Date;
  inMonth: boolean;
  day: number;
};

@Component({
  selector: 'st-date',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-input.html',
  styleUrls: ['./date-input.css'],
})
export class DateComponent {
  @Input({ required: true }) control!: AbstractControl;

  @Input() label = '';
  @Input() placeholder = 'YYYY.MM.DD';
  @Input() required = false;
  @Input() min?: string; // "YYYY-MM-DD"
  @Input() max?: string; // "YYYY-MM-DD"

  @ViewChild('root', { static: true }) rootRef!: ElementRef<HTMLElement>;

  open = false;

  // Calendar state
  viewYear!: number;
  viewMonth!: number; // 0..11

  monthOptions = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString('en', { month: 'short' }),
  );

  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnInit() {
    const selected = this.selectedDate;
    const base = selected ?? new Date();
    this.viewYear = base.getFullYear();
    this.viewMonth = base.getMonth();
  }

  get invalid(): boolean {
    return !!this.control && this.control.invalid && this.control.touched;
  }

  get valueText(): string {
    const v = this.control?.value;
    if (!v) return '';
    // Accept "YYYY.MM.DD" already
    if (typeof v === 'string' && /^\d{4}\.\d{2}\.\d{2}$/.test(v)) return v;

    // Accept Date
    if (v instanceof Date && !isNaN(v.getTime())) return this.format(v);

    // Accept "YYYY-MM-DD"
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const d = this.parseISO(v);
      return d ? this.format(d) : '';
    }

    return '';
  }

  get selectedDate(): Date | null {
    const v = this.control?.value;
    if (!v) return null;

    if (v instanceof Date && !isNaN(v.getTime())) return v;

    if (typeof v === 'string') {
      if (/^\d{4}\.\d{2}\.\d{2}$/.test(v)) return this.parse(v);
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return this.parseISO(v);
    }

    return null;
  }

  toggle() {
    this.open = !this.open;
    if (this.open) {
      const selected = this.selectedDate;
      const base = selected ?? new Date();
      this.viewYear = base.getFullYear();
      this.viewMonth = base.getMonth();
    }
    this.control?.markAsTouched();
  }

  close() {
    this.open = false;
  }

  prevMonth() {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
  }

  nextMonth() {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
  }

  setMonth(month: string | number) {
    const m = Number(month);
    if (Number.isNaN(m)) return;
    this.viewMonth = Math.min(11, Math.max(0, m));
  }

  setYear(year: string | number) {
    const y = Number(year);
    if (Number.isNaN(y)) return;
    this.viewYear = y;
  }

  get yearOptions(): number[] {
    const minD = this.min ? this.parseISO(this.min) : null;
    const maxD = this.max ? this.parseISO(this.max) : null;

    const center = this.viewYear ?? new Date().getFullYear();
    const fallbackStart = center - 50;
    const fallbackEnd = center + 50;

    const start = minD ? minD.getFullYear() : fallbackStart;
    const end = maxD ? maxD.getFullYear() : fallbackEnd;

    const safeStart = Math.min(start, end);
    const safeEnd = Math.max(start, end);

    const years: number[] = [];
    for (let y = safeStart; y <= safeEnd; y++) years.push(y);
    return years;
  }

  get grid(): DayCell[] {
    // Monday-first calendar
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const last = new Date(this.viewYear, this.viewMonth + 1, 0);

    const start = new Date(first);
    const firstDow = (first.getDay() + 6) % 7; // convert Sun(0)->6, Mon(1)->0...
    start.setDate(first.getDate() - firstDow);

    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      cells.push({
        date: d,
        day: d.getDate(),
        inMonth: d.getMonth() === this.viewMonth,
      });
    }

    return cells;
  }

  isSelected(d: Date): boolean {
    const s = this.selectedDate;
    if (!s) return false;
    return (
      s.getFullYear() === d.getFullYear() &&
      s.getMonth() === d.getMonth() &&
      s.getDate() === d.getDate()
    );
  }

  isDisabled(d: Date): boolean {
    const minD = this.min ? this.parseISO(this.min) : null;
    const maxD = this.max ? this.parseISO(this.max) : null;

    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (minD) {
      const mn = new Date(minD.getFullYear(), minD.getMonth(), minD.getDate()).getTime();
      if (t < mn) return true;
    }
    if (maxD) {
      const mx = new Date(maxD.getFullYear(), maxD.getMonth(), maxD.getDate()).getTime();
      if (t > mx) return true;
    }
    return false;
  }

  pick(d: Date) {
    if (this.isDisabled(d)) return;

    // Store as "YYYY.MM.DD" (matches screenshot)
    const formatted = this.format(d);
    this.control?.setValue(formatted);
    this.control?.markAsDirty();
    this.control?.markAsTouched();
    this.close();
  }

  // -------- formatting/parsing --------

  private format(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  private parse(s: string): Date | null {
    // "YYYY.MM.DD"
    const m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  private parseISO(s: string): Date | null {
    // "YYYY-MM-DD"
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  // Close on outside click
  @HostListener('document:mousedown', ['$event'])
  onDocMouseDown(e: MouseEvent) {
    if (!this.open) return;
    const root = this.rootRef?.nativeElement;
    if (root && !root.contains(e.target as Node)) this.close();
  }

  // Close on ESC
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open) this.close();
  }
}
