import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'st-input',
  standalone: true, // ✅ REQUIRED
  imports: [CommonModule, ReactiveFormsModule], // ✅ REQUIRED
  templateUrl: './input.html',
  styleUrls: ['./input.css'],
})
export class InputComponent {
  @Input({ required: true }) control!: FormControl;

  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' = 'text';
  @Input() icon: string | null = null;
  @Input() required = false;

  @Input() id?: string;
  @Input() hideLabel = false;

  showPassword = false;

  get inputType(): string {
    if (this.type !== 'password') return this.type;
    return this.showPassword ? 'text' : 'password';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get invalid(): boolean {
    return this.control.invalid && this.control.touched;
  }
}
