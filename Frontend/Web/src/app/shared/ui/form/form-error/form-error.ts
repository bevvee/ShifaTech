import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'st-form-error',
  templateUrl: './form-error.html',
  styleUrl: './form-error.css'
})
export class FormErrorComponent {
  @Input({ required: true }) control!: AbstractControl;

  get message(): string | null {
    if (!this.control || !this.control.touched || !this.control.errors) return null;

    if (this.control.errors['required']) return 'Champ obligatoire';
    if (this.control.errors['email']) return 'Email invalide';
    if (this.control.errors['minlength'])
      return `Minimum ${this.control.errors['minlength'].requiredLength} caractères`;

    return 'Valeur invalide';
  }
}
