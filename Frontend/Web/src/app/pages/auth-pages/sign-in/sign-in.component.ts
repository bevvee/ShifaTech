import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';

@Component({
  selector: 'app-sign-in',
  imports: [
    FormsModule,
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
  ],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class SignInComponent {

  email = '';
  password = '';
  rememberMe = false;

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    console.log('Remember Me:', this.rememberMe);
  }

  onGoogleLogin() {
    console.log('Google login');
  }

}
