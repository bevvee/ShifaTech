import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileImageComponent } from '../../../../../shared/ui/form/profile-image/profile-image';
import { FileUploadDropComponent } from '../../../../../shared/ui/form/file-upload-drop/file-upload-drop';

@Component({
  selector: 'st-add-doctor',
  standalone: true,
imports: [CommonModule, ReactiveFormsModule, ProfileImageComponent, FileUploadDropComponent],
  templateUrl: './add-doctor.html',
})
export class AddDoctorComponent {
  // later you’ll fetch these from API
  specialites = [
    { id: 1, name: 'Cardiologie' },
    { id: 2, name: 'Dermatologie' },
    { id: 3, name: 'Pédiatrie' },
  ];
  private fb = inject(FormBuilder);

  selectedPhoto: File | null = null;
photo: File | null = null;

  form = this.fb.group({
    // USER
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    cin: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    mot_de_passe: ['', [Validators.required, Validators.minLength(8)]],
    sexe: ['F', [Validators.required]], // 'M' | 'F'
    statut: ['ACTIF', [Validators.required]], // 'ACTIF' | 'INACTIF'
    date_naissance: ['', [Validators.required]],
    telephone: ['', [Validators.required, Validators.minLength(8)]],
    adresse: ['', [Validators.required, Validators.minLength(5)]],

    // DOCTOR
    numero_ordre: ['', [Validators.required, Validators.minLength(3)]],
    id_specialite: [null as number | null, [Validators.required]],
  });

  constructor() {}

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // payload to send to backend
    const payload = {
      user: {
        nom: this.form.value.nom,
        prenom: this.form.value.prenom,
        cin: this.form.value.cin,
        email: this.form.value.email,
        mot_de_passe: this.form.value.mot_de_passe,
        role: 'DOCTOR',
        sexe: this.form.value.sexe,
        statut: this.form.value.statut,
        date_naissance: this.form.value.date_naissance,
        telephone: this.form.value.telephone,
        adresse: this.form.value.adresse,
      },
      doctor: {
        numero_ordre: this.form.value.numero_ordre,
        id_specialite: this.form.value.id_specialite,
      },
    };

    console.log('ADD DOCTOR payload:', payload, { selectedPhoto: this.selectedPhoto });

    // later: call API
    // this.doctorService.createDoctor(payload).subscribe(...)
  }

  // helper
  isInvalid(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return c.touched && c.invalid;
  }
}
