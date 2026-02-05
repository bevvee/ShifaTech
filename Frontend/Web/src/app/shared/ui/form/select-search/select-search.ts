import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

export type StSelectOption<T = any> = {
  value: T;
  label: string;
  iconUrl?: string; // optional (flags / avatars)
  disabled?: boolean;
};

@Component({
  selector: 'st-select-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-search.html',
})
export class SelectSearchComponent<T = any> {
  @Input({ required: true }) control!: AbstractControl;

  @Input() label = '';
  @Input() placeholder = 'Select...';
  @Input() searchPlaceholder = 'Search...';
  @Input() options: StSelectOption<T>[] = [];

  @Input() required = false;
  @Input() disabled = false;

  @Output() selectionChange = new EventEmitter<T>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  open = false;
  query = '';
  activeIndex = 0;

  get invalid(): boolean {
    return !!this.control && this.control.invalid && this.control.touched;
  }

  get selected(): StSelectOption<T> | undefined {
    const v = this.control?.value;
    return this.options.find((o) => this.isEqual(o.value, v));
  }

  get filtered(): StSelectOption<T>[] {
    const q = this.query.trim().toLowerCase();
    const base = !q
      ? this.options
      : this.options.filter((o) => o.label.toLowerCase().includes(q));

    return base;
  }

  toggle() {
    if (this.disabled) return;
    this.open = !this.open;
    if (this.open) {
      this.query = '';
      this.activeIndex = 0;
      setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
    }
  }

  close() {
    this.open = false;
    this.query = '';
  }

  pick(opt: StSelectOption<T>) {
    if (this.disabled || opt.disabled) return;

    this.control.setValue(opt.value);
    this.control.markAsDirty();
    this.control.markAsTouched();

    this.selectionChange.emit(opt.value);
    this.close();
  }

  onSearch(value: string) {
    this.query = value;
    this.activeIndex = 0;
  }

  // keyboard navigation
  onKeydown(e: KeyboardEvent) {
    if (!this.open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, this.filtered.length - 1);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const opt = this.filtered[this.activeIndex];
      if (opt) this.pick(opt);
      return;
    }
  }

  // close when clicking outside
  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as Node;
    if (!this.host.nativeElement.contains(target)) this.close();
  }

  // simple equality (handles primitives)
  private isEqual(a: any, b: any) {
    return a === b;
  }
}
