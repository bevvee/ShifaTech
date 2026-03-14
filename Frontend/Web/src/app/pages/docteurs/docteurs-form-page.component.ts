import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { DoctorService } from '../../core/services/doctor.service';
import { SpecialityService } from '../../core/services/speciality.service';
import { AuthService } from '../../core/services/auth.service';
import { Doctor } from '../../core/models/doctor.model';
import { Sexe } from '../../core/models/sexe.enum';

@Component({
    selector: 'app-docteurs-form-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PageBreadcrumbComponent,
        ComponentCardComponent,
        ButtonComponent,
        InputFieldComponent,
        TextAreaComponent,
        LabelComponent,
        SelectComponent,
    ],
    templateUrl: './docteurs-form-page.component.html',
})
export class DocteursFormPageComponent implements OnInit {
    mode: 'create' | 'edit' = 'create';
    editingId: number | null = null;
    submitted = false;

    editingIdUser: number | null = null;

    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly doctorService = inject(DoctorService);
    private readonly specialityService = inject(SpecialityService);
    private readonly authService = inject(AuthService);

    sexeOptions: Option[] = [
        { value: Sexe.H, label: 'Masculin' },
        { value: Sexe.F, label: 'Féminin' },
    ];

    statutOptions: Option[] = [
        { value: 'true', label: 'Actif' },
        { value: 'false', label: 'Inactif' },
    ];

    specialiteOptions: Option[] = [];

    form: {
        nom: string;
        prenom: string;
        cin: string;
        email: string;
        password: string;
        sexe: Sexe;
        statutValue: 'true' | 'false';
        dateNaissance: string;
        telephone: string;
        adresse: string;
        numeroOrdre: string;
        idSpecialite: string;
    } = this.emptyForm();

    ngOnInit() {
        this.loadSpecialities();

        // Check if we are in edit mode
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam && idParam !== 'new') {
            this.mode = 'edit';
            this.editingId = Number(idParam);
            this.loadDoctor(this.editingId);
        }
    }

    loadSpecialities() {
        this.specialityService.getSpecialities().subscribe({
            next: (data) => {
                this.specialiteOptions = data.map(s => ({
                    value: String(s.idSpecialite),
                    label: s.label // Removed ID from display
                }));
            },
            error: (err: any) => console.error('Error loading specialities', err)
        });
    }

    loadDoctor(id: number) {
        this.doctorService.getDoctor(id).subscribe({
            next: (doctor: Doctor) => {
                this.editingIdUser = doctor.idUser || null;
                this.form = {
                    nom: doctor.nom || '',
                    prenom: doctor.prenom || '',
                    cin: doctor.cin || '',
                    email: doctor.email || '',
                    password: '', // Password is empty on edit
                    sexe: doctor.sexe === ('M' as any) ? Sexe.H : (doctor.sexe || Sexe.H),
                    statutValue: doctor.statut ? 'true' : 'false',
                    dateNaissance: doctor.dateNaissance || '',
                    telephone: doctor.telephone || '',
                    adresse: doctor.adresse || '',
                    numeroOrdre: doctor.numeroOrdre || '',
                    idSpecialite: String(doctor.idSpecialite),
                };
            },
            error: (err: any) => console.error('Error loading doctor', err)
        });
    }

    get isValid(): boolean {
        const valid = (
            !!this.form.nom?.trim() &&
            !!this.form.prenom?.trim() &&
            !!this.form.cin?.trim() &&
            !!this.form.email?.trim() &&
            !!this.form.telephone?.trim() &&
            !!this.form.dateNaissance?.trim() &&
            !!this.form.numeroOrdre?.trim() &&
            !!this.form.idSpecialite &&
            (this.mode === 'edit' || (!!this.form.password && this.form.password.trim().length > 0))
        );
        return valid;
    }

    save() {
        this.submitted = true;
        if (!this.isValid) return;

        const statut = this.form.statutValue === 'true';
        const payload: Partial<Doctor> & { password?: string } = {
            nom: this.form.nom.trim(),
            prenom: this.form.prenom.trim(),
            cin: this.form.cin.trim(),
            email: this.form.email.trim(),
            statut,
            dateNaissance: this.form.dateNaissance,
            telephone: this.form.telephone.trim(),
            adresse: this.form.adresse.trim(),
            numeroOrdre: this.form.numeroOrdre.trim(),
            idSpecialite: Number(this.form.idSpecialite),
            sexe: (this.form.sexe === Sexe.H ? 'M' : this.form.sexe) as any,
        };

        if (this.mode === 'create') {
            const userPayload = {
                nom: payload.nom,
                prenom: payload.prenom,
                cin: payload.cin,
                email: payload.email,
                password: this.form.password,
                passwordConfirmation: this.form.password,
                sexe: this.form.sexe === Sexe.H ? 'M' : 'F',
                statut: payload.statut,
                telephone: payload.telephone,
                adresse: payload.adresse,
                dateNaissance: payload.dateNaissance,
                role: 'DOCTEUR'
            };

            this.authService.register(userPayload).subscribe({
                next: (res: any) => {
                    if (res.error) {
                        alert('Erreur: ' + res.message);
                        this.submitted = false;
                        return;
                    }

                    const idUser = res.user?.idUser;
                    if (!idUser) {
                        alert('Erreur: ID utilisateur introuvable dans la réponse.');
                        this.submitted = false;
                        return;
                    }

                    // Proceed to create Doctor profile
                    this.doctorService.createDoctor({ ...payload, idUser }).subscribe({
                        next: () => this.goBack(),
                        error: (err: any) => {
                            console.error('Error creating doctor', err);
                            const msg = err.error?.message || 'L\'utilisateur a été créé, mais la création du profil docteur a échoué.';
                            alert('Erreur: ' + msg);
                            this.submitted = false;
                        }
                    });
                },
                error: (err: any) => {
                    console.error('Error registering user', err);
                    const msg = err.error?.message || 'Erreur système lors de la création de l\'utilisateur.';
                    alert('Erreur: ' + msg);
                    this.submitted = false;
                }
            });
        } else if (this.editingId) {
            const updateDoctorOnly = () => {
                this.doctorService.updateDoctor(this.editingId!, payload).subscribe({
                    next: () => this.goBack(),
                    error: (err: any) => {
                        console.error('Error updating doctor', err);
                        alert('Erreur lors de la mise à jour du profil docteur.');
                        this.submitted = false;
                    }
                });
            };

            if (this.editingIdUser) {
                const userPayload: any = {
                    nom: payload.nom,
                    prenom: payload.prenom,
                    cin: payload.cin,
                    email: payload.email,
                    sexe: this.form.sexe === Sexe.H ? 'M' : 'F',
                    statut: payload.statut,
                    telephone: payload.telephone,
                    adresse: payload.adresse,
                    dateNaissance: payload.dateNaissance,
                };

                if (this.form.password && this.form.password.trim().length > 0) {
                    userPayload.motDePasse = this.form.password;
                }

                this.authService.updateUser(this.editingIdUser, userPayload).subscribe({
                    next: (res: any) => {
                        if (res.error) {
                            alert('Erreur: ' + res.message);
                            this.submitted = false;
                            return;
                        }
                        updateDoctorOnly();
                    },
                    error: (err: any) => {
                        console.error('Error updating user', err);
                        const msg = err.error?.message || 'Erreur système lors de la mise à jour de l\'utilisateur.';
                        alert('Erreur: ' + msg);
                        this.submitted = false;
                    }
                });
            } else {
                updateDoctorOnly();
            }
        }
    }

    goBack() {
        this.router.navigate(['/docteurs']);
    }

    private emptyForm() {
        return {
            nom: '',
            prenom: '',
            cin: '',
            email: '',
            password: '',
            sexe: Sexe.H,
            statutValue: 'true' as const,
            dateNaissance: '',
            telephone: '',
            adresse: '',
            numeroOrdre: '',
            idSpecialite: '',
        };
    }
}
