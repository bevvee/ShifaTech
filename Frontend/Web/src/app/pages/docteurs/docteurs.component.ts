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

type Sexe = 'M' | 'F';

type DocteurRow = {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  role: 'DOCTEUR';
  sexe: Sexe;
  statut: boolean;
  dateNaissance: string; 
  telephone: string;
  adresse: string;
  numeroOrdre: string;
  idSpecialite: number;
};

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

  docteurs: DocteurRow[] = [
    {
      id: 1,
      nom: 'Benali',
      prenom: 'Sara',
      cin: 'AB123456',
      email: 'sara.benali@shifatech.test',
      role: 'DOCTEUR',
      sexe: 'F',
      statut: true,
      dateNaissance: '1990-04-12',
      telephone: '+212600000000',
      adresse: 'Casablanca',
      numeroOrdre: 'ORD-2026-001',
      idSpecialite: 1,
    },
    {
      id: 2,
      nom: 'El Idrissi',
      prenom: 'Youssef',
      cin: 'CD789012',
      email: 'youssef.elidrissi@shifatech.test',
      role: 'DOCTEUR',
      sexe: 'M',
      statut: true,
      dateNaissance: '1987-09-03',
      telephone: '+212611111111',
      adresse: 'Rabat',
      numeroOrdre: 'ORD-2026-002',
      idSpecialite: 2,
    },
    {
      id: 3,
      nom: 'Ait Lahcen',
      prenom: 'Khadija',
      cin: 'EF345678',
      email: 'khadija.aitlahcen@shifatech.test',
      role: 'DOCTEUR',
      sexe: 'F',
      statut: false,
      dateNaissance: '1993-01-27',
      telephone: '+212622222222',
      adresse: 'Marrakech',
      numeroOrdre: 'ORD-2026-003',
      idSpecialite: 3,
    },
  ];

  private nextId = 4;

  private readonly subscription = new Subscription();

  constructor(private readonly router: Router) {}

  ngOnInit() {
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
    { value: 'M', label: 'M' },
    { value: 'F', label: 'F' },
  ];

  statutOptions: Option[] = [
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ];

  specialiteOptions: Option[] = [
    { value: '1', label: '1 - Cardiologie' },
    { value: '2', label: '2 - Dermatologie' },
    { value: '3', label: '3 - Pédiatrie' },
    { value: '4', label: '4 - Neurologie' },
    { value: '5', label: '5 - Ophtalmologie' },
  ];

  form: {
    nom: string;
    prenom: string;
    cin: string;
    email: string;
    motDePasse: string;
    sexe: Sexe;
    statutValue: 'true' | 'false';
    dateNaissance: string;
    telephone: string;
    adresse: string;
    numeroOrdre: string;
    idSpecialite: string;
  } = this.emptyForm();

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

  openEditModal(row: DocteurRow) {
    this.mode = 'edit';
    this.editingId = row.id;
    this.submitted = false;
    this.form = {
      nom: row.nom,
      prenom: row.prenom,
      cin: row.cin,
      email: row.email,
      motDePasse: '',
      sexe: row.sexe,
      statutValue: row.statut ? 'true' : 'false',
      dateNaissance: row.dateNaissance,
      telephone: row.telephone,
      adresse: row.adresse,
      numeroOrdre: row.numeroOrdre,
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
    return (
      this.form.nom.trim().length > 0 &&
      this.form.prenom.trim().length > 0 &&
      this.form.cin.trim().length > 0 &&
      this.form.email.trim().length > 0 &&
      this.form.telephone.trim().length > 0 &&
      this.form.dateNaissance.trim().length > 0 &&
      this.form.numeroOrdre.trim().length > 0 &&
      this.form.idSpecialite.trim().length > 0 &&
      Number(this.form.idSpecialite) > 0 &&
      (this.mode === 'edit' || this.form.motDePasse.trim().length > 0)
    );
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const statut = this.form.statutValue === 'true';
    const payload: Omit<DocteurRow, 'id'> = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      cin: this.form.cin.trim(),
      email: this.form.email.trim(),
      role: 'DOCTEUR',
      sexe: this.form.sexe,
      statut,
      dateNaissance: this.form.dateNaissance,
      telephone: this.form.telephone.trim(),
      adresse: this.form.adresse.trim(),
      numeroOrdre: this.form.numeroOrdre.trim(),
      idSpecialite: Number(this.form.idSpecialite),
    };

    if (this.mode === 'create') {
      this.docteurs = [{ id: this.nextId++, ...payload }, ...this.docteurs];
      this.closeModal();
      return;
    }

    const id = this.editingId;
    if (id == null) return;
    this.docteurs = this.docteurs.map((d) => (d.id === id ? { id, ...payload } : d));
    this.closeModal();
  }

  private emptyForm() {
    return {
      nom: '',
      prenom: '',
      cin: '',
      email: '',
      motDePasse: '',
      sexe: 'M' as Sexe,
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
