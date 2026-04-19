import { Component, Input } from '@angular/core';
import { InputFieldComponent } from './../../form/input/input-field.component';
import { ModalService } from '../../../services/modal.service';

import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { loadProfileSuccess } from '../../../../core/store/auth/auth.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-user-meta-card',
  imports: [
    ModalComponent,
    InputFieldComponent,
    ButtonComponent,
    FormsModule
  ],
  templateUrl: './user-meta-card.component.html',
  styles: ``
})
export class UserMetaCardComponent {

  constructor(
    public modal: ModalService,
    private authService: AuthService,
    private store: Store,
    private toast: ToastService
  ) { }

  isOpen = false;
  openModal() {
    this.editedUser = { ...this.user };
    this.isOpen = true;
  }
  closeModal() { this.isOpen = false; }

  @Input() user: any;
  editedUser: any = {};

  handleSave() {
    const userId = this.user?.idUser;
    if (!userId) {
      console.error('User ID not found', this.user);
      return;
    }

    const payload = {
      nom: this.editedUser.nom,
      prenom: this.editedUser.prenom,
      email: this.editedUser.email,
      telephone: this.editedUser.telephone,
      adresse: this.editedUser.adresse,
      sexe: this.editedUser.sexe,
      dateNaissance: this.editedUser.dateNaissance
    };

    this.authService.updateUser(userId, payload).subscribe({
      next: (res: any) => {
        if (!res.error) {
          // Use the user object returned by the API
          const updatedUser = res.user || { ...this.user, ...payload };
          this.store.dispatch(loadProfileSuccess({ profile: updatedUser }));
          this.toast.success('Succès', 'Profil mis à jour avec succès.');
          this.isOpen = false;
          this.modal.closeModal();
        } else {
          console.error('Update failed:', res.message);
          this.toast.error('Erreur', this.formatErrorMessage(res.message));
        }
      },
      error: (err: any) => {
        console.error('Error updating profile:', err);
        const errorMessage = err?.error?.message || err?.message || 'Erreur lors de la mise à jour du profil';
        this.toast.error('Erreur', this.formatErrorMessage(errorMessage));
      }
    });
  }

  private formatErrorMessage(errMessage: string): string {
    if (!errMessage) return 'Une erreur est survenue lors de la mise à jour.';
    if (errMessage.includes(';')) {
      return errMessage.split(';')
        .map(msg => msg.trim())
        .filter(msg => msg.length > 0)
        .map(msg => `• ${msg}`)
        .join('\n');
    }
    return errMessage;
  }
}

