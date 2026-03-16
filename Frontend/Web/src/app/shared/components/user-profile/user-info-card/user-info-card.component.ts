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
    this.editedUser.motDePasse = '';
    this.editedUser.motDePasseConfirmation = '';
    if (this.editedUser.dateNaissance) {
      this.editedUser.dateNaissance = this.editedUser.dateNaissance.substring(0, 10);
    }
    if (this.editedUser.statut !== undefined && this.editedUser.statut !== null) {
      this.editedUser.statut = String(this.editedUser.statut);
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
  statutOptions = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' }
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
      statut: this.editedUser.statut === 'true' || this.editedUser.statut === true,
      dateNaissance: this.editedUser.dateNaissance,
      cin: this.editedUser.cin,
      motDePasse: this.editedUser.motDePasse,
      motDePasseConfirmation: this.editedUser.motDePasseConfirmation
    };

    if (!payload.nom || !payload.prenom || !payload.email || !payload.telephone || !payload.cin) {
      this.toast.error('Erreur', 'Veuillez remplir tous les champs obligatoires (Nom, Prenom, Email, CIN, Telephone)');
      return;
    }

    if (payload.motDePasse && payload.motDePasse !== payload.motDePasseConfirmation) {
      this.toast.error('Erreur', 'Le mot de passe et la confirmation ne correspondent pas');
      return;
    }

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
          this.toast.error('Erreur', res.message || 'La mise à jour a échoué');
          console.error('Update failed:', res.message);
        }
      },
      error: (err: any) => {
        this.toast.error('Erreur', err.error?.message || 'Erreur lors de la mise à jour du profil');
        console.error('Error updating profile:', err);
      }
    });
  }
}
