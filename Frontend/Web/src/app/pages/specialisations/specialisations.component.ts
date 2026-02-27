import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';

type SpecialisationRow = {
  id: number;
  nom: string;
  description: string;
  statut: boolean;
};

@Component({
  selector: 'app-specialisations',
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
  templateUrl: './specialisations.component.html',
  styles: ``
})
export class SpecialisationsComponent {

  specialisations: SpecialisationRow[] = [
    {
      id: 1,
      nom: 'Cardiologie',
      description: 'Spécialité du coeur et des vaisseaux.',
      statut: true,
    },
  ];

  private nextId = 2;
  private readonly subscription = new Subscription();

  isModalOpen = false;
  mode: 'create' | 'edit' = 'create';
  submitted = false;
  editingId: number | null = null;

  statutOptions: Option[] = [
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' },
  ];

  form: {
    nom: string;
    description: string;
    statutValue: 'true' | 'false';
  } = this.emptyForm();

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

  goToCreate() {
    this.router.navigate(['/specialisations/new']);
  }

  openCreateModal() {
    this.mode = 'create';
    this.editingId = null;
    this.submitted = false;
    this.form = this.emptyForm();
    this.isModalOpen = true;
  }

  openEditModal(row: SpecialisationRow) {
    this.mode = 'edit';
    this.editingId = row.id;
    this.submitted = false;
    this.form = {
      nom: row.nom,
      description: row.description,
      statutValue: row.statut ? 'true' : 'false',
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.router.url === '/specialisations/new') {
      this.router.navigate(['/specialisations']);
    }
  }

  get isValid(): boolean {
    return this.form.nom.trim().length > 0 && this.form.description.trim().length > 0;
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const statut = this.form.statutValue === 'true';
    const payload: Omit<SpecialisationRow, 'id'> = {
      nom: this.form.nom.trim(),
      description: this.form.description.trim(),
      statut,
    };

    if (this.mode === 'create') {
      this.specialisations = [{ id: this.nextId++, ...payload }, ...this.specialisations];
      this.closeModal();
      return;
    }

    const id = this.editingId;
    if (id == null) return;
    this.specialisations = this.specialisations.map((s) => (s.id === id ? { id, ...payload } : s));
    this.closeModal();
  }

  private emptyForm() {
    return {
      nom: '',
      description: '',
      statutValue: 'true' as const,
    };
  }

  private handleUrl(url: string) {
    if (url === '/specialisations/new') {
      this.openCreateModal();
    }
  }

}
