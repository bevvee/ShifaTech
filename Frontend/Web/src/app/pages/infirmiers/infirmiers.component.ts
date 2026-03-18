import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AlertService } from '../../core/services/alert.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { TableDropdownComponent } from '../../shared/components/common/table-dropdown/table-dropdown.component';

type Sexe = 'M' | 'F';

type InfirmierRow = {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  role: 'INFIRMIER';
  sexe: Sexe;
  statut: boolean;
  dateNaissance: string;
  telephone: string;
  adresse: string;

  idService: number;
  idSpecialite: number;
};

@Component({
  selector: 'app-infirmiers',
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
    TableDropdownComponent,
  ],
  templateUrl: './infirmiers.component.html',
  styles: ``
})
export class InfirmiersComponent {

  infirmiers: InfirmierRow[] = [
    {
      id: 1,
      nom: 'Haddad',
      prenom: 'Imane',
      cin: 'IN123456',
      email: 'imane.haddad@shifatech.test',
      role: 'INFIRMIER',
      sexe: 'F',
      statut: true,
      dateNaissance: '1995-03-19',
      telephone: '+212644444444',
      adresse: 'Fès',
      idService: 1,
      idSpecialite: 1,
    },
  ];

  private nextId = 2;
  private readonly subscription = new Subscription();

  isModalOpen = false;
  mode: 'create' | 'edit' = 'create';
  submitted = false;
  editingId: number | null = null;

  currentPage = 1;
  itemsPerPage = 5;

  sexeOptions: Option[] = [
    { value: 'M', label: 'M' },
    { value: 'F', label: 'F' },
  ];

  statutOptions: Option[] = [
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ];

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
  } = this.emptyForm();

  constructor(
    private readonly router: Router,
    private readonly alerts: AlertService,
  ) {}

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

  goToCreate() {
    this.router.navigate(['/infirmiers/new']);
  }

  openCreateModal() {
    this.mode = 'create';
    this.editingId = null;
    this.submitted = false;
    this.form = this.emptyForm();
    this.isModalOpen = true;
  }

  openEditModal(row: InfirmierRow) {
    this.mode = 'edit';
    this.editingId = row.id;
    this.submitted = false;
    this.form = {
      nom: row.nom,
      prenom: row.prenom,
      cin: row.cin,
      email: row.email,
      password: '',
      sexe: row.sexe,
      statutValue: row.statut ? 'true' : 'false',
      dateNaissance: row.dateNaissance,
      telephone: row.telephone,
      adresse: row.adresse,
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.router.url === '/infirmiers/new') {
      this.router.navigate(['/infirmiers']);
    }
  }

  deleteInfirmier(id: number) {
    void this.confirmAndDeleteInfirmier(id);
  }

  private async confirmAndDeleteInfirmier(id: number) {
    const ok = await this.alerts.confirmDelete('cet infirmier');
    if (!ok) return;

    this.infirmiers = this.infirmiers.filter((i) => i.id !== id);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.infirmiers.length / this.itemsPerPage));
  }

  get currentInfirmiersItems(): InfirmierRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.infirmiers.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
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
      (this.mode === 'edit' || this.form.password.trim().length > 0)
    );
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const statut = this.form.statutValue === 'true';
    const payloadBase: Omit<InfirmierRow, 'id' | 'idService' | 'idSpecialite'> = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      cin: this.form.cin.trim(),
      email: this.form.email.trim(),
      role: 'INFIRMIER',
      sexe: this.form.sexe,
      statut,
      dateNaissance: this.form.dateNaissance,
      telephone: this.form.telephone.trim(),
      adresse: this.form.adresse.trim(),
    };

    if (this.mode === 'create') {
      const id = this.nextId++;
      const payload: InfirmierRow = {
        id,
        ...payloadBase,
        idService: 1,
        idSpecialite: 1,
      };
      this.infirmiers = [payload, ...this.infirmiers];
      this.currentPage = 1;
      this.closeModal();
      return;
    }

    const id = this.editingId;
    if (id == null) return;

    const existing = this.infirmiers.find((i) => i.id === id);
    if (!existing) return;

    const updated: InfirmierRow = {
      ...existing,
      ...payloadBase,
    };

    this.infirmiers = this.infirmiers.map((i) => (i.id === id ? updated : i));
    this.closeModal();
  }

  private emptyForm() {
    return {
      nom: '',
      prenom: '',
      cin: '',
      email: '',
      password: '',
      sexe: 'M' as Sexe,
      statutValue: 'true' as const,
      dateNaissance: '',
      telephone: '',
      adresse: '',
    };
  }

  private handleUrl(url: string) {
    if (url === '/infirmiers/new') {
      this.openCreateModal();
    }
  }

}
