import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoaderService } from '../../../../../core/services/loader.service';

@Component({
  selector: 'st-add-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-doctor.html',
})
export class AddDoctorComponent {
  specialites = [
    { id: 1, name: 'Cardiologie' },
    { id: 2, name: 'Dermatologie' },
    { id: 3, name: 'Pédiatrie' },
  ];

  form;

  constructor(
    private fb: FormBuilder,
    private loader: LoaderService
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      cin: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(8)]],
      sexe: ['F', [Validators.required]],
      statut: ['ACTIF', [Validators.required]],
      date_naissance: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.minLength(8)]],
      adresse: ['', [Validators.required, Validators.minLength(5)]],
      numero_ordre: ['', [Validators.required, Validators.minLength(3)]],
      id_specialite: [null as number | null, [Validators.required]],
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

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

    this.loader.show(); // ✅ show overlay

    try {
      // TEMP: simulate API call (remove later)
      await new Promise((res) => setTimeout(res, 1200));

      console.log('ADD DOCTOR payload:', payload);

      // later:
      // await firstValueFrom(this.doctorService.createDoctor(payload));
    } finally {
      this.loader.hide(); // ✅ always hide
    }
  }

  isInvalid(name: any) {
    const c = this.form.get(name);
    return !!(c && c.touched && c.invalid);
  }


}

