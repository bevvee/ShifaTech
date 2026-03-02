import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../core/store/auth/auth.selectors';
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
  console.log('[LOGIN] Submitting login form', {
    email: this.email
  });

  this.authService.login({ email: this.email, password: this.password }).subscribe({
    next: (res: any) => {
      this.isLoading = false;

      console.log('[LOGIN] API response:', res);

      if (res && res.token) {
        console.log('[LOGIN] Token received:', res.token);

        this.authService.saveToken(res.token);
        console.log('[LOGIN] Token saved, waiting for store update...');

        this.store.select(selectUserRole).pipe(take(1)).subscribe(role => {
          console.log('[LOGIN] Role from store:', role);

          if (role === 'ADMIN') {
            console.log('[LOGIN] Redirecting to /admin');
            this.router.navigate(['/admin']);

          } else if (role === 'DOCTEUR') {
            console.log('[LOGIN] Redirecting to /docteur');
            this.router.navigate(['/docteur']);

          } else if (role === 'INFIRMIER') {
            console.log('[LOGIN] Redirecting to /infirmier');
            this.router.navigate(['/infirmier']);

          } else if (role === 'PATIENT') {
            console.log('[LOGIN] Redirecting to /patients');
            this.router.navigate(['/patients']);

          } else {
            console.warn('[LOGIN] Unknown role, redirecting to /');
            this.router.navigate(['/']);
          }
        });

      } else if (res && res.message) {
        console.warn('[LOGIN] API message:', res.message);
        this.errorMessage = res.message;
      }
    },

    error: (err: any) => {
      this.isLoading = false;
      console.error('[LOGIN] API error:', err);
      this.errorMessage =
        err?.error?.message || 'Email ou mot de passe incorrect.';
    }
  });
}

  onGoogleLogin() {
    console.log('Google login');
  }

}
