import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule, LabelComponent],
  templateUrl: './date-picker.component.html',
  styles: ``
})
export class DatePickerComponent implements OnInit, OnChanges {

  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Output() dateChange = new EventEmitter<any>();

  isOpen = false;
  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();
  selectedDay: { day: number; month: number; year: number } | null = null;

  readonly months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  readonly dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.syncFromDefaultDate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['defaultDate']) {
      this.syncFromDefaultDate();
    }
  }

  get monthLabel(): string {
    return `${this.months[this.viewMonth]} ${this.viewYear}`;
  }

  get selectedDateLabel(): string {
    if (!this.selectedDay) return this.placeholder || 'Select date';
    const monthShort = this.months[this.selectedDay.month].slice(0, 3);
    return `${monthShort} ${this.selectedDay.day}, ${this.selectedDay.year}`;
  }

  get dayCells(): Array<number | null> {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_v, i) => i + 1),
    ];
  }

  togglePicker() {
    this.isOpen = !this.isOpen;
  }

  changeMonth(dir: number) {
    this.viewMonth += dir;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear++;
    }
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear--;
    }
  }

  goToToday() {
    const today = new Date();
    this.viewYear = today.getFullYear();
    this.viewMonth = today.getMonth();
  }

  selectDay(day: number) {
    this.selectedDay = { day, month: this.viewMonth, year: this.viewYear };
    this.isOpen = false;

    const dateStr = this.toDateStr(this.viewYear, this.viewMonth, day);
    const date = new Date(this.viewYear, this.viewMonth, day);
    this.dateChange.emit({ selectedDates: [date], dateStr, instance: null });
  }

  isToday(day: number): boolean {
    const today = new Date();
    return (
      day === today.getDate() &&
      this.viewMonth === today.getMonth() &&
      this.viewYear === today.getFullYear()
    );
  }

  isSelected(day: number): boolean {
    return (
      !!this.selectedDay &&
      day === this.selectedDay.day &&
      this.viewMonth === this.selectedDay.month &&
      this.viewYear === this.selectedDay.year
    );
  }

  dayClass(day: number): string {
    let cls = 'text-center text-xs rounded-lg py-1 cursor-pointer transition ';
    if (this.isSelected(day)) {
      cls += 'bg-blue-500 text-white font-semibold';
    } else if (this.isToday(day)) {
      cls += 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100';
    } else {
      cls += 'text-gray-700 hover:bg-gray-100';
    }
    return cls;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen) return;
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.isOpen = false;
    }
  }

  private syncFromDefaultDate() {
    const parsed = this.parseDefaultDate(this.defaultDate);
    if (!parsed) {
      this.selectedDay = null;
      return;
    }

    this.viewYear = parsed.getFullYear();
    this.viewMonth = parsed.getMonth();
    this.selectedDay = {
      day: parsed.getDate(),
      month: parsed.getMonth(),
      year: parsed.getFullYear(),
    };
  }

  private parseDefaultDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    if (Array.isArray(value) && value.length) {
      return this.parseDefaultDate(value[0]);
    }
    return null;
  }

  private toDateStr(year: number, monthIndex: number, day: number): string {
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
}
