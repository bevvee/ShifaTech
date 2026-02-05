import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'st-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkbox.html',
  styleUrls: ['./checkbox.css'],
})
export class CheckboxComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() id = 'checkbox';
  @Input() label = '';
  @Input() required = false;

  get invalid(): boolean {
    return this.control.invalid && this.control.touched;
  }
}
