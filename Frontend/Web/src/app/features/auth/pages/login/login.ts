import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/ui/form/input/input';
import { CheckboxComponent } from '../../../../shared/ui/form/checkbox/checkbox';
import { Icon } from '../../../../shared/ui/icons/Icon';

@Component({
  selector: 'st-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, CheckboxComponent, Icon],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(false, { nonNullable: true }),
  });

  get email(): FormControl<string> {
    return this.form.controls.email;
  }

  get password(): FormControl<string> {
    return this.form.controls.password;
  }

  get rememberMe(): FormControl<boolean> {
    return this.form.controls.rememberMe;
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    // TODO: wire to auth API
    // const { email, password, rememberMe } = this.form.getRawValue();
  }

  onGoogleLogin() {
    // TODO: wire to Google OAuth flow
  }
}
