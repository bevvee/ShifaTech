import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { filter, Subscription } from 'rxjs';
import { DoctorService } from '../../core/services/doctor.service';
import { SpecialityService } from '../../core/services/speciality.service';
import { Doctor } from '../../core/models/doctor.model';
import { Speciality } from '../../core/models/speciality.model';
import { Sexe } from '../../core/models/sexe.enum';
import { AlertService } from '../../core/services/alert.service';


@Component({
  selector: 'app-docteurs',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    ModalComponent,
    InputFieldComponent,
    TextAreaComponent,
    LabelComponent,
    BadgeComponent,
    SelectComponent,
  ],
  templateUrl: './docteurs.component.html',
  styles: ``
})
export class DocteursComponent {

  docteurs: Doctor[] = [];

  private nextId = 4;

  private readonly subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly doctorService: DoctorService,
    private readonly specialityService: SpecialityService,
    private readonly alerts: AlertService,
  ) { }

  loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.docteurs = data;
        this.filteredDocteurs = data;
      },
      error: (err: any) => console.error('Error loading doctors', err)
    });
  }

  loadSpecialities() {
    this.specialityService.getSpecialities().subscribe({
      next: (data) => {
        this.specialiteOptions = data.map(s => ({
          value: String(s.idSpecialite),
          label: `${s.idSpecialite} - ${s.label}`
        }));
      },
      error: (err: any) => console.error('Error loading specialities', err)
    });
  }

  ngOnInit() {
    this.loadDoctors();
    this.loadSpecialities();
    this.handleUrl(this.router.url);
    this.subscription.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => this.handleUrl(this.router.url)),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isModalOpen = false;
  mode: 'create' | 'edit' = 'create';
  submitted = false;
  editingId: number | null = null;

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

  searchTerm = '';
  filteredDocteurs: Doctor[] = [];

  onSearch() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) {
      this.filteredDocteurs = this.docteurs;
    } else {
      this.filteredDocteurs = this.docteurs.filter(d =>
        (d.nom?.toLowerCase().includes(q)) ||
        (d.prenom?.toLowerCase().includes(q)) ||
        (d.numeroOrdre?.toLowerCase().includes(q)) ||
        (d.specialiteLabel?.toLowerCase().includes(q))
      );
    }
  }

  openCreateModal() {
    this.mode = 'create';
    this.editingId = null;
    this.submitted = false;
    this.form = this.emptyForm();
    this.isModalOpen = true;
  }

  goToCreate() {
    this.router.navigate(['/docteurs/new']);
  }

  openEditModal(row: Doctor) {
    this.mode = 'edit';
    this.editingId = row.idDocteur;
    this.submitted = false;
    this.form = {
      nom: row.nom || '',
      prenom: row.prenom || '',
      cin: row.cin || '',
      email: row.email || '',
      password: '',
      sexe: row.sexe === ('M' as any) ? Sexe.H : (row.sexe || Sexe.H),
      statutValue: row.statut ? 'true' : 'false',
      dateNaissance: row.dateNaissance || '',
      telephone: row.telephone || '',
      adresse: row.adresse || '',
      numeroOrdre: row.numeroOrdre || '',
      idSpecialite: String(row.idSpecialite),
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;

    if (this.router.url === '/docteurs/new') {
      this.router.navigate(['/docteurs']);
    }
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
    const payload: Omit<Doctor, 'idDocteur'> = {
      idUser: 1, // Placeholder, should be handled by auth
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
      specialiteLabel: '', // Will be updated by server
      sexe: (this.form.sexe === Sexe.H ? 'M' : this.form.sexe) as any,
    };

    if (this.mode === 'create') {
      this.doctorService.createDoctor({ ...payload, idUser: 1 }).subscribe({ // idUser needs to be handled
        next: () => {
          this.loadDoctors();
          this.closeModal();
        },
        error: (err: any) => console.error('Error creating doctor', err)
      });
      return;
    }

    const id = this.editingId;
    if (id == null) return;
    this.doctorService.updateDoctor(id, payload).subscribe({
      next: () => {
        this.loadDoctors();
        this.closeModal();
      },
      error: (err: any) => console.error('Error updating doctor', err)
    });
  }

  deleteDoctor(id: number) {
    void this.confirmAndDeleteDoctor(id);
  }

  private async confirmAndDeleteDoctor(id: number) {
    const ok = await this.alerts.confirmDelete('ce docteur');
    if (!ok) return;

    this.doctorService.deleteDoctor(id).subscribe({
      next: () => this.loadDoctors(),
      error: (err: any) => console.error('Error deleting doctor', err)
    });
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

  private handleUrl(url: string) {
    if (url === '/docteurs/new') {
      this.openCreateModal();
    }
  }
}
