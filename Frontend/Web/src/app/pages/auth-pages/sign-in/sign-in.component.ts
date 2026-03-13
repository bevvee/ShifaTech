import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectUserRole, selectAuthUser } from '../../../core/store/auth/auth.selectors';
import { take } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  imports: [
    FormsModule,
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    CommonModule
  ],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class SignInComponent {

  email = '';
  password = '';
  rememberMe = false;

  showPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      console.warn('[LOGIN] Missing email or password');
      return;
    }

    this.isLoading = true;


    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        const token = res && (res.token || res.accessToken);

        if (token) {

          this.authService.saveToken(token);

          this.store.select(selectAuthUser).pipe(take(1)).subscribe(userPayload => {
          });

          this.store.select(selectUserRole).pipe(take(1)).subscribe(role => {

            const userRole = role?.toUpperCase();

            if (userRole === 'ADMIN') {
              this.router.navigate(['/admin']);

            } else if (userRole === 'DOCTEUR') {
              this.router.navigate(['/docteur']);

            } else if (userRole === 'INFIRMIER') {
              this.router.navigate(['/infirmier']);

            } else if (userRole === 'PATIENT') {
               this.errorMessage = "Email ou mot de passe incorrect.";
              this.authService.logout();

            } else {
                  this.errorMessage = "Email ou mot de passe incorrect.";
              this.authService.logout();
            }
          });

        } else if (res && res.message) {
          this.errorMessage = res.message;
        }
      },

      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Email ou mot de passe incorrect.';
      }
    });
  }

  onGoogleLogin() {
  }

}
