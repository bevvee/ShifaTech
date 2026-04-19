import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { Output, EventEmitter } from '@angular/core';
import { Role } from '../../../../core/models/role.enum';

export type RendezVousRow = {
  id: string;
  patient: string;
  patientImage?: string;
  medecin: string;
  medecinImage?: string;
  date: string;
  heure: string;
  statut: 'Confirmé' | 'En attente' | 'Annulé' | 'Terminé';
};

@Component({
  selector: 'app-basic-table-three',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent
  ],
  templateUrl: './basic-table-three.component.html'
})
export class BasicTableThreeComponent {

  @Input() title: string = 'Liste';
  @Input() rendezVousData: RendezVousRow[] = [];
  @Input() serverSidePagination = false;
  @Input() totalItems: number | null = null;

  @Input() currentPage = 1;
  @Input() itemsPerPage = 10;

  @Input() currentRole: Role | string | null = null;

  protected readonly Role = Role;

  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  @Output() view = new EventEmitter<RendezVousRow>();
@Output() edit = new EventEmitter<RendezVousRow>();
@Output() delete = new EventEmitter<RendezVousRow>();

  get canEditOrDelete(): boolean {
    const role = String(this.currentRole ?? '').toUpperCase();
    return role !== Role.DOCTEUR && role !== Role.INFIRMIER;
  }

  get totalPages(): number {
    const total = this.serverSidePagination
      ? Number(this.totalItems ?? 0)
      : (this.rendezVousData?.length ?? 0);

    return Math.max(1, Math.ceil(total / Math.max(1, this.itemsPerPage)));
  }

  get currentRendezVousItems(): RendezVousRow[] {
  if (this.serverSidePagination) {
    return this.rendezVousData ?? [];
  }

  const start = (this.currentPage - 1) * this.itemsPerPage;
  return (this.rendezVousData ?? []).slice(start, start + this.itemsPerPage);
}

get currentItems(): RendezVousRow[] {
  return this.currentRendezVousItems;
}

handleViewMore(item: RendezVousRow) {
this.view.emit(item);
}

handleEdit(item: RendezVousRow) {
this.edit.emit(item);
}

handleDelete(item: RendezVousRow) {
this.delete.emit(item);
}
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;

      if (this.serverSidePagination) {
        this.pageChange.emit(this.currentPage);
      }
    }
  }

  onItemsPerPageSelect(value: string): void {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) return;

    this.itemsPerPage = next;
    this.currentPage = 1;

    if (this.serverSidePagination) {
      this.itemsPerPageChange.emit(this.itemsPerPage);
    }
  }

  get totalItemsLabel(): string {
    const total = this.serverSidePagination
      ? Number(this.totalItems ?? 0)
      : (this.rendezVousData?.length ?? 0);
    return String(total);
  }

  getBadgeColor(status: string): 'success' | 'warning' | 'error' {

  if (status === 'Confirmé' || status === 'Terminé') {
    return 'success';
  }

  if (status === 'En attente') {
    return 'warning';
  }

  return 'error';
}

}