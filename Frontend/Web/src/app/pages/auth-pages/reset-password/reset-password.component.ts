import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        LabelComponent,
        InputFieldComponent,
    ],
    templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
    token = '';
    newPassword = '';
    confirmPassword = '';

    isLoading = false;
    errorMessage = '';
    successMessage = '';
    showPassword = false;

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.token = params['token'] || '';
        });
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.token) {
            this.errorMessage = 'Jeton invalide ou manquant.';
            return;
        }

        if (!this.newPassword || !this.confirmPassword) {
            this.errorMessage = 'Veuillez remplir tous les champs.';
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage = 'Les mots de passe ne correspondent pas.';
            return;
        }

        this.isLoading = true;
        this.authService.resetPassword(this.token, this.newPassword, this.confirmPassword).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (!res.error) {
                    this.successMessage = res.message || 'Mot de passe réinitialisé avec succès.';
                    setTimeout(() => {
                        this.router.navigate(['/signin']);
                    }, 2000);
                } else {
                    this.errorMessage = res.message;
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                this.errorMessage = err?.error?.message || 'Erreur lors de la réinitialisation du mot de passe.';
            }
        });
    }
}
