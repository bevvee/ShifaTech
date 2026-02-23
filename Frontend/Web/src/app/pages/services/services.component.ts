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
import { TableDropdownComponent } from '../../shared/components/common/table-dropdown/table-dropdown.component';

type ServiceRow = {
  id: number;
  label: string;
  description: string;
};

@Component({
  selector: 'app-services',
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
    TableDropdownComponent,
  ],
  templateUrl: './services.component.html',
  styles: ``
})
export class ServicesComponent {

  services: ServiceRow[] = [
    {
      id: 1,
      label: 'Consultation',
      description: 'Consultation médicale générale.',
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

  form: {
    label: string;
    description: string;
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
    this.router.navigate(['/services/new']);
  }

  openCreateModal() {
    this.mode = 'create';
    this.editingId = null;
    this.submitted = false;
    this.form = this.emptyForm();
    this.isModalOpen = true;
  }

  openEditModal(row: ServiceRow) {
    this.mode = 'edit';
    this.editingId = row.id;
    this.submitted = false;
    this.form = {
      label: row.label,
      description: row.description,
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.router.url === '/services/new') {
      this.router.navigate(['/services']);
    }
  }

  deleteService(id: number) {
    this.services = this.services.filter((s) => s.id !== id);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.services.length / this.itemsPerPage));
  }

  get currentServicesItems(): ServiceRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.services.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get isValid(): boolean {
    return this.form.label.trim().length > 0 && this.form.description.trim().length > 0;
  }

  save() {
    this.submitted = true;
    if (!this.isValid) return;

    const payload: Omit<ServiceRow, 'id'> = {
      label: this.form.label.trim(),
      description: this.form.description.trim(),
    };

    if (this.mode === 'create') {
      this.services = [{ id: this.nextId++, ...payload }, ...this.services];
      this.currentPage = 1;
      this.closeModal();
      return;
    }

    const id = this.editingId;
    if (id == null) return;
    this.services = this.services.map((s) => (s.id === id ? { id, ...payload } : s));
    this.closeModal();
  }

  private emptyForm() {
    return {
      label: '',
      description: '',
    };
  }

  private handleUrl(url: string) {
    if (url === '/services/new') {
      this.openCreateModal();
    }
  }

}
