import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'st-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css'],
})
export class SearchComponent {
  @Input({ required: true }) control!: FormControl;

  @Input() label = '';
  @Input() placeholder = 'Search...';
  @Input() id = 'search';
  @Input() disabled = false;

  clear() {
    this.control?.setValue('');
    this.control?.markAsDirty();
    this.control?.markAsTouched();
  }

  get hasValue(): boolean {
    const v = this.control?.value;
    return v !== null && v !== undefined && String(v).length > 0;
  }
}
