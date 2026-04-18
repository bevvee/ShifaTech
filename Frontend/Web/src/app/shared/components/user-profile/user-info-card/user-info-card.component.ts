import { Component, Input } from '@angular/core';
import { ModalService } from '../../../services/modal.service';

import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { loadProfileSuccess } from '../../../../core/store/auth/auth.actions';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

import { SelectComponent } from '../../form/select/select.component';

@Component({
  selector: 'app-user-info-card',
  imports: [
    InputFieldComponent,
    SelectComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent {

  constructor(
    public modal: ModalService,
    private authService: AuthService,
    private store: Store,
    private toast: ToastService
  ) { }

  isOpen = false;
  openModal() {
    this.editedUser = { ...this.user };
    if (this.editedUser.dateNaissance) {
      this.editedUser.dateNaissance = this.editedUser.dateNaissance.substring(0, 10);
    }
    this.isOpen = true;
  }
  closeModal() { this.isOpen = false; }

  @Input() user: any;
  editedUser: any = {};
  sexeOptions = [
    { label: 'Homme', value: 'M' },
    { label: 'Femme', value: 'F' }
  ];

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
      role: this.editedUser.role,
      dateNaissance: this.editedUser.dateNaissance,
      statut: this.editedUser.statut
    };

    this.authService.updateUser(userId, payload).subscribe({
      next: (res: any) => {
        if (!res.error) {
          // Use the user object returned by the API
          const updatedUser = res.user || { ...this.user, ...payload };
          this.store.dispatch(loadProfileSuccess({ profile: updatedUser }));
          this.toast.success('Succès', 'Votre profil a été mis à jour avec succès.');
          this.isOpen = false;
          this.modal.closeModal();
        } else {
          console.error('Update failed:', res.message);
        }
      },
      error: (err: any) => {
        console.error('Error updating profile:', err);
      }
    });
  }
}
