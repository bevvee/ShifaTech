import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'st-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './textarea.html',
  styleUrls: ['./textarea.css'],
})
export class TextareaComponent {
  @Input({ required: true }) control!: FormControl;

  @Input() id = 'textarea';
  @Input() label = '';
  @Input() placeholder = 'Say hi...';
  @Input() rows = 3;
  @Input() required = false;

  get invalid(): boolean {
    return this.control.invalid && this.control.touched;
  }
}
