
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-signup-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './signup-form.component.html',
  styles: ``
})
export class SignupFormComponent {

  showPassword = false;
  showConfirmPassword = false;
  isChecked = false;

  fname = '';
  lname = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  cin = '';
  role = 'PATIENT';
  sexe = 'M';
  dateNaissance = '';
  telephone = '';
  adresse = '';

  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.isChecked) {
      this.errorMessage = 'Vous devez accepter les termes et conditions.';
      return;
    }
    if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    const request = {
      nom: this.lname,
      prenom: this.fname,
      cin: this.cin,
      email: this.email,
      password: this.password,
      passwordConfirmation: this.passwordConfirmation,
      role: this.role,
      sexe: this.sexe,
      dateNaissance: this.dateNaissance,
      telephone: this.telephone,
      adresse: this.adresse
    };

    this.authService.register(request).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (!res.error) {
          this.router.navigate(['/signin']); // Redirect to login
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Une erreur est survenue lors de l\'inscription.';
      }
    });
  }
}
