import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RdvService } from '../../core/services/rdv.service';
import { PageBreadcrumbComponent } from "../../shared/components/common/page-breadcrumb/page-breadcrumb.component";
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { DatePickerComponent } from '../../shared/components/form/date-picker/date-picker.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { TimePickerComponent } from '../../shared/components/form/time-picker/time-picker.component';

@Component({
  selector: 'app-rdv-edit',
  standalone: true,
  templateUrl: './rdv-edit.component.html',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    DatePickerComponent,
    LabelComponent,
    InputFieldComponent,
    SelectComponent,
    TimePickerComponent,
  ],
})
export class RdvEditComponent implements OnInit {

  rdv: any = {};

  statusOptions: Option[] = [
    { value: 'Confirmé', label: 'Confirmé' },
    { value: 'En attente', label: 'En attente' },
    { value: 'Annulé', label: 'Annulé' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rdvService: RdvService
  ) {}

  ngOnInit() {

    const idParam = this.route.snapshot.params['id'];
    const id = Number(idParam);

    this.rdvService.getById(id).subscribe({
      next: data => this.rdv = data,
      error: err => console.error(err)
    });

  }

  onDateChange(event: any) {
    this.rdv.date_rdv = event?.dateStr ?? this.rdv.date_rdv;
  }

  onStartTimeChange(time: string) {
    this.rdv.heure_debut = time;
  }

  onEndTimeChange(time: string) {
    this.rdv.heure_fin = time;
  }

  onStatusChange(value: string) {
    this.rdv.status = value;
  }

  save() {
    const rawId = this.rdv?.id_rdv ?? this.rdv?.id;
    const id = Number(rawId);
    if (!Number.isFinite(id)) return;

    this.rdvService.update(id, this.rdv).subscribe({
      next: () => this.router.navigate(['/rendez-vous']),
      error: err => console.error(err)
    });

  }

}