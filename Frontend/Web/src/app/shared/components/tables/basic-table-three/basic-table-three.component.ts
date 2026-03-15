import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { Output, EventEmitter } from '@angular/core';

export type RendezVousRow = {
  id: string;
  patient: string;
  medecin: string;
  date: string;
  heure: string;
  statut: 'Confirmé' | 'En attente' | 'Annulé' | 'Terminé';
};

@Component({
  selector: 'app-basic-table-three',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TableDropdownComponent,
    BadgeComponent
  ],
  templateUrl: './basic-table-three.component.html'
})
export class BasicTableThreeComponent {

  @Input() title: string = 'Liste';
  @Input() rendezVousData: RendezVousRow[] = [];
  @Output() view = new EventEmitter<RendezVousRow>();
@Output() edit = new EventEmitter<RendezVousRow>();
@Output() delete = new EventEmitter<RendezVousRow>();

  currentPage = 1;
  itemsPerPage = 10;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rendezVousData.length / this.itemsPerPage));
  }

  get currentRendezVousItems(): RendezVousRow[] {
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
    }
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