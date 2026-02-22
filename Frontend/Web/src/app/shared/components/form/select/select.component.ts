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
  ViewChild,
} from '@angular/core';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

export interface Option {
  value: string;
  label: string;
	/** Optional icon markup (SVG/IMG HTML). */
	icon?: string;
}

@Component({
  selector: 'app-select',
	imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './select.component.html',
})
export class SelectComponent implements OnInit, OnChanges {
  @Input() options: Option[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() className: string = '';
  @Input() defaultValue: string = '';
  @Input() value: string = '';

	@Input() disabled = false;
	@Input() hasSearch = true;
	@Input() searchLimit = 5;
	@Input() searchPlaceholder = 'Search...';

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  isOpen = false;
  search = '';
  highlightedIndex = -1;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit() {
    if (!this.value && this.defaultValue) {
      this.value = this.defaultValue;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['defaultValue'] || changes['value']) {
      if (!this.value && this.defaultValue) {
        this.value = this.defaultValue;
      }
    }
  }

  get selectedOption(): Option | undefined {
    return this.options.find((option) => option.value === this.value);
  }

  get filteredOptions(): Option[] {
    const normalizedSearch = this.search.trim().toLowerCase();
    const options = normalizedSearch
      ? this.options.filter((option) =>
          option.label.toLowerCase().includes(normalizedSearch),
        )
      : this.options;

    return typeof this.searchLimit === 'number' && this.searchLimit > 0
      ? options.slice(0, this.searchLimit)
      : options;
  }

  toggleOpen() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.highlightedIndex = this.value
        ? Math.max(
            0,
            this.filteredOptions.findIndex((o) => o.value === this.value),
          )
        : 0;

      if (this.hasSearch) {
        setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
      }
    }
  }

  close() {
    this.isOpen = false;
    this.search = '';
    this.highlightedIndex = -1;
  }

  select(option: Option) {
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.close();
  }

  onSearchInput(value: string) {
    this.search = value;
    this.highlightedIndex = this.filteredOptions.length ? 0 : -1;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen) return;
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedIndex = Math.min(
        this.filteredOptions.length - 1,
        this.highlightedIndex + 1,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedIndex = Math.max(0, this.highlightedIndex - 1);
      return;
    }

    if (event.key === 'Enter') {
      if (this.highlightedIndex >= 0) {
        event.preventDefault();
        const option = this.filteredOptions[this.highlightedIndex];
        if (option) this.select(option);
      }
    }
  }

  // Kept for backward compatibility if someone still uses the hidden <select>
  onNativeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.value = value;
    this.valueChange.emit(value);
  }
}