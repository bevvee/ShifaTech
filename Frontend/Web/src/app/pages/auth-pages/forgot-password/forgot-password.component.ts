import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        LabelComponent,
        InputFieldComponent,
    ],
    templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
    email = '';
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    onSubmit() {
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.email) {
            this.errorMessage = 'Veuillez entrer votre email.';
            return;
        }

        this.isLoading = true;
        this.authService.forgotPassword(this.email).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (!res.error) {
                    this.successMessage = res.message || 'Lien de réinitialisation envoyé.';
                } else {
                    this.errorMessage = res.message;
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                this.errorMessage = err?.error?.message || 'Erreur lors de l\'envoi de l\'email.';
            }
        });
    }
}
