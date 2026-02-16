import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'st-radio-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radio-group.html',
  styleUrls: ['./radio-group.css'],
})
export class RadioGroupComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() label = '';
  @Input() name = 'radio-group';
  @Input() required = false;

  @Input() options: Array<{ value: string; label: string; disabled?: boolean; id?: string }> = [];

  get invalid(): boolean {
    return this.control.invalid && this.control.touched;
  }

  optionId(opt: { id?: string }, index: number): string {
    return opt.id || `${this.name}-${index}`;
  }
}
