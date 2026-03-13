import { Component, inject } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { BasicTableThreeComponent } from '../../shared/components/tables/basic-table-three/basic-table-three.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import {
  Option,
  SelectComponent,
} from '../../shared/components/form/select/select.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { DatePickerComponent } from '../../shared/components/form/date-picker/date-picker.component';
import { TimePickerComponent } from '../../shared/components/form/time-picker/time-picker.component';

import { RdvService } from '../../core/services/rdv.service';
import { RdvCreateDto, RdvDto } from '../../core/models/rdv.model';

type RendezVousStatus = 'Confirmé' | 'En attente' | 'Annulé';

type RendezVous = {
  id: string;
  patient: string;
  medecin: string;
  date: string;
  heure: string;
  status: RendezVousStatus;
};

@Component({
  selector: 'app-rendez-vous',
  standalone: true,
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BasicTableThreeComponent,
    ModalComponent,
    SelectComponent,
    LabelComponent,
    DatePickerComponent,
    TimePickerComponent,
  ],
  templateUrl: './RendezVous.component.html',
})
export class RendezVousComponent {

  private rdvService = inject(RdvService);

  // Modal state
  selectedRdv: RendezVous | null = null;
  isOpen = false;

  loading = false;
  errorMsg = '';

  // Form fields
  id_patient = '';
  id_docteur = '';
  date_rdv = '';
  heure_rdv = '';
  statut: RendezVousStatus | '' = '';

  patientOptions: Option[] = [
    { value: '1', label: 'Patient oussama' },
    { value: '2', label: 'Patient C' },
    { value: '3', label: 'Patient E' },
  ];

  docteurOptions: Option[] = [
    { value: '1', label: 'Dr. B' },
    { value: '2', label: 'Dr. D' },
    { value: '3', label: 'Dr. F' },
  ];

  statutOptions: Option[] = [
    { value: 'Confirmé', label: 'Confirmé' },
    { value: 'En attente', label: 'En attente' },
    { value: 'Annulé', label: 'Annulé' },
  ];

  rendezVous: RendezVous[] = [];

  trackById = (_index: number, item: RendezVous) => item.id;

  openModal(rdv?: RendezVous) {
    this.isOpen = true;
    this.selectedRdv = rdv ?? null;

    if (!rdv) {
      this.resetModalFields();
      return;
    }

    this.date_rdv = rdv.date;
    this.heure_rdv = rdv.heure;
    this.statut = rdv.status;
  }

  resetModalFields() {
    this.selectedRdv = null;
    this.id_patient = '';
    this.id_docteur = '';
    this.date_rdv = '';
    this.heure_rdv = '';
    this.statut = '';
    this.errorMsg = '';
  }

handleAddOrUpdateEvent() {

  if (!this.id_patient || !this.id_docteur || !this.date_rdv || !this.heure_rdv) {
    this.errorMsg = 'Tous les champs sont obligatoires';
    return;
  }

  const dto = {
    id_patient: Number(this.id_patient),
    id_docteur: Number(this.id_docteur),
    date_rdv: this.date_rdv,
    heure_rdv: this.heure_rdv + ':00',
    statut: 'PENDING',
    created_at: new Date().toISOString(),
    created_by: 1
  };

  this.loading = true;

  this.rdvService.create(dto).subscribe({
    next: (res) => {
      this.loading = false;
      this.closeModal();
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
      this.errorMsg = 'Erreur backend';
    }
  });
}

  onDateChange(event: { dateStr?: string } | null | undefined) {
    this.date_rdv = event?.dateStr ?? '';
  }

  onTimeChange(value: string) {
    this.heure_rdv = value;
  }

  onStatutChange(value: string) {
    if (value === 'Confirmé' || value === 'En attente' || value === 'Annulé') {
      this.statut = value;
    }
  }

  private getOptionLabel(options: Option[], value: string): string | undefined {
    return options.find(option => option.value === value)?.label;
  }

  private mapStatusToBackend(status: RendezVousStatus | ''): string {
    switch (status) {
      case 'Confirmé': return 'CONFIRMED';
      case 'Annulé': return 'CANCELLED';
      case 'En attente': return 'PENDING';
      default: return 'PENDING';
    }
  }

  closeModal() {
    this.isOpen = false;
    this.resetModalFields();
  }
}
