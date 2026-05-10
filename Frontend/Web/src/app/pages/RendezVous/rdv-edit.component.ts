import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RdvService } from '../../core/services/rdv.service';
import { DoctorService } from '../../core/services/doctor.service';
import { PatientApiService } from '../../core/services/api/patient-api.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { DatePickerComponent } from '../../shared/components/form/date-picker/date-picker.component';
import { TimePickerComponent } from '../../shared/components/form/time-picker/time-picker.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';

type Mode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-rdv-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    LabelComponent,
    DatePickerComponent,
    TimePickerComponent,
    SelectComponent,
  ],
  templateUrl: './rdv-edit.component.html',
})
export class RdvEditComponent implements OnInit {
  mode: Mode = 'create';
  loading = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rdvService = inject(RdvService);
  private readonly doctorService = inject(DoctorService);
  private readonly patientService = inject(PatientApiService);

  private id: number | null = null;

  statusOptions: Option[] = [
    { value: 'CONFIRME', label: 'Confirmé' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'ANNULE', label: 'Annulé' },
  ];

  patientOptions: Option[] = [];
  doctorOptions: Option[] = [];

  form = {
    id_patient: '' as string | number,
    id_docteur: '' as string | number,
    date_rdv: '',
    heure_debut: '',
    heure_fin: '',
    statut: 'EN_ATTENTE',
  };

  ngOnInit() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    this.loadOptions();

    if (this.mode !== 'create' && this.id != null) {
      this.rdvService.getById(this.id).subscribe({
        next: (existing: any) => {
          this.form = {
            id_patient: existing.id_patient,
            id_docteur: existing.id_docteur,
            date_rdv: existing.date_rdv,
            heure_debut: existing.heure_debut,
            heure_fin: existing.heure_fin,
            statut: existing.statut || existing.status || 'EN_ATTENTE',
          };
        },
        error: () => this.router.navigate(['/rendez-vous'])
      });
    }
  }

  loadOptions() {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctorOptions = doctors.map(d => ({
          value: d.idDocteur.toString(),
          label: `Dr. ${d.nom || ''} ${d.prenom || ''}`.trim() || `Docteur ${d.idDocteur}`
        }));
      },
      error: (err) => console.error('Erreur chargement docteurs', err)
    });

    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patientOptions = patients.map(p => ({
          value: p.id.toString(),
          label: `${p.nom || ''} ${p.prenom || ''}`.trim() || `Patient ${p.id}`
        }));
      },
      error: (err) => console.error('Erreur chargement patients', err)
    });
  }

  onDateChange(event: any) {
    this.form.date_rdv = event?.dateStr ?? this.form.date_rdv;
  }

  onStartTimeChange(time: string) {
    this.form.heure_debut = time;
  }

  onEndTimeChange(time: string) {
    this.form.heure_fin = time;
  }

  onStatusChange(value: string) {
    this.form.statut = value;
  }

  cancel() {
    this.router.navigate(['/rendez-vous']);
  }

  save() {
    this.loading = true;
    if (this.mode === 'create') {
      this.rdvService.create(this.form as any).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/rendez-vous']);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else if (this.id != null) {
      this.rdvService.update(this.id, this.form as any).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/rendez-vous']);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
  }
}