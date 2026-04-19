import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RdvService } from '../../core/services/rdv.service';
import { PageBreadcrumbComponent } from "../../shared/components/common/page-breadcrumb/page-breadcrumb.component";
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { PatientApiService } from '../../core/services/api/patient-api.service';
import { DoctorService } from '../../core/services/doctor.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { RdvCreateDto } from '../../core/models/rdv.model';
import { PatientDto } from '../../core/models/patient.model';

@Component({
  selector: 'app-rdv-view',
  standalone: true,
  templateUrl: './rdv-view.component.html',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    LabelComponent,
  ],
})
export class RdvViewComponent implements OnInit {

  rdv: any;
  rdvSlotLabel = '';

  patientLabel = '';
  patientInitials = '';
  doctorLabel = '';
  doctorInitials = '';

  patientIcon = '';
  doctorIcon = '';

  constructor(
    private route: ActivatedRoute,
    private rdvService: RdvService,
    private patientApi: PatientApiService,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {

    const idParam = this.route.snapshot.params['id'];
    const id = Number(idParam);
    if (!Number.isFinite(id)) return;

    this.rdvService.getById(id).pipe(
      switchMap((data: RdvCreateDto) => {
        this.rdv = data;
        this.rdvSlotLabel = this.formatSlot(
          data?.date_rdv,
          data?.heure_debut,
          data?.heure_fin,
        );

        const patientId = data?.id_patient;
        const doctorId = data?.id_docteur;

        return forkJoin({
          patient: patientId ? this.patientApi.getById(patientId).pipe(catchError(() => of(null as PatientDto | null))) : of(null as PatientDto | null),
          doctor: doctorId ? this.doctorService.getDoctor(doctorId).pipe(catchError(() => of(null as any))) : of(null as any)
        });
      })
    ).subscribe({
      next: ({ patient, doctor }: { patient: PatientDto | null, doctor: any }) => {
        // Resolve Patient
        const pLabel = patient ? `${patient.prenom} ${patient.nom}`.trim() : `Patient #${this.rdv?.id_patient}`;
        this.patientLabel = pLabel;
        this.patientInitials = this.initialsFromName(pLabel);
        this.patientIcon = patient?.sexe === 'F' ? 'assets/img/patient-female.png' : 'assets/img/patient-male.png';

        // Resolve Doctor
        const dLabel = doctor ? `Dr ${doctor.prenom} ${doctor.nom}`.trim() : `Docteur #${this.rdv?.id_docteur}`;
        this.doctorLabel = dLabel;
        this.doctorInitials = this.initialsFromName(dLabel);
        this.doctorIcon = (doctor as any)?.sexe === 'F' ? 'assets/img/user-pink.png' : 'assets/img/user-grey.png';
      },
      error: err => console.error(err)
    });

  }

  private formatSlot(dateValue: unknown, startTime: unknown, endTime: unknown): string {
    const date = this.formatDate(dateValue);
    const range = this.formatTimeRange(startTime, endTime);
    if (date && range) return `${date} ${range}`;
    return date || range || '';
  }

  private formatDate(value: unknown): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(String(value));
    if (isNaN(date.getTime())) return String(value);

    // Matches the requested style: "14 Sept 2026"
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private formatTimeRange(start: unknown, end: unknown): string {
    const startLabel = this.formatTime(start);
    const endLabel = this.formatTime(end);
    if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
    return startLabel || endLabel || '';
  }

  private formatTime(value: unknown): string {
    if (!value) return '';

    if (value instanceof Date && !isNaN(value.getTime())) {
      const hh = String(value.getHours()).padStart(2, '0');
      const mm = String(value.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}H`;
    }

    const raw = String(value).trim();

    // Matches the FIRST occurrence of HH:mm at the start OR after a standard separator like 'T' or ' '
    const match = raw.match(/(?:^|[T\s])(\d{1,2}):(\d{2})\b/);
    if (!match) return raw;

    const hh = String(Number(match[1])).padStart(2, '0');
    const mm = match[2];
    return `${hh}:${mm}H`;
  }

  private buildPerson(data: any, kind: 'patient' | 'doctor'): { label: string; initials: string } {
    const id = kind === 'patient' ? data?.id_patient : data?.id_docteur;

    // Try common shapes: { patient: { prenom, nom } } / { doctor: { firstName, lastName } }
    // and also direct fields like patient_nom/patient_prenom.
    const obj =
      data?.[kind] ??
      data?.[kind === 'doctor' ? 'docteur' : 'patient'] ??
      null;

    const first =
      obj?.prenom ??
      obj?.firstName ??
      obj?.firstname ??
      data?.[kind === 'patient' ? 'patient_prenom' : 'doctor_prenom'] ??
      data?.[kind === 'patient' ? 'patient_firstName' : 'doctor_firstName'] ??
      '';

    const last =
      obj?.nom ??
      obj?.lastName ??
      obj?.lastname ??
      data?.[kind === 'patient' ? 'patient_nom' : 'doctor_nom'] ??
      data?.[kind === 'patient' ? 'patient_lastName' : 'doctor_lastName'] ??
      '';

    const fullName = `${String(first).trim()} ${String(last).trim()}`.trim();
    const label = fullName || `${kind === 'patient' ? 'Patient' : 'Docteur'} #${id ?? ''}`.trim();

    return {
      label,
      initials: this.initialsFromName(fullName || label),
    };
  }

  private initialsFromName(name: string): string {
    const cleaned = String(name).trim();
    if (!cleaned) return '';

    const words = cleaned
      .split(/\s+/)
      .map((w) => w.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, ''))
      .filter(Boolean);

    if (!words.length) return '';

    const first = words[0]?.[0] ?? '';
    const second = words.length > 1 ? (words[1]?.[0] ?? '') : (words[0]?.[1] ?? '');
    return (first + second).toUpperCase();
  }

}