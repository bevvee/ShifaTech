import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'st-select',
  templateUrl: './select.html',
  styleUrls: ['./select.css'],
})
export class SelectComponent {
  @Input({ required: true }) control!: AbstractControl;
  @Input() label = '';
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Choisir...';
}
