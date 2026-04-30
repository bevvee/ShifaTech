import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { RdvService } from '../../../../core/services/rdv.service';
import { RdvStatut } from '../../../../core/models/rdv-statut.enum';

interface PendingRequestItem {
  id: number | string;
  patientName: string;
  dateLabel: string;
  timeLabel: string;
  specialtyLabel: string;
  badgeClass: string;
}

@Component({
  selector: 'app-appointment-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointment-requests.component.html',
})
export class AppointmentRequestsComponent implements OnInit {
  private readonly rdvService = inject(RdvService);

  isLoading = true;
  requests: PendingRequestItem[] = [];

  ngOnInit(): void {
    this.loadRequests();
  }

  get visibleRequests(): PendingRequestItem[] {
    return this.requests.slice(0, 5);
  }

  private loadRequests(): void {
    this.isLoading = true;

    this.rdvService
      .getAll({
        statut: RdvStatut.EN_ATTENTE,
        pagination: false,
        page: 1,
        itemsPerPage: 1000,
      })
      .pipe(
        map((res: any) => this.extractArrayFromResponse(res)),
        catchError(() => of([] as any[])),
        map((items) =>
          items
            .map((item, index) => this.mapToRequestItem(item, index))
            .filter((request): request is PendingRequestItem => request !== null),
        ),
      )
      .subscribe((requests) => {
        this.requests = requests.sort((a, b) => a.dateLabel.localeCompare(b.dateLabel) || a.timeLabel.localeCompare(b.timeLabel));
        this.isLoading = false;
      });
  }

  private extractArrayFromResponse(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res['hydra:member'])) return res['hydra:member'];
    if (res && Array.isArray(res.member)) return res.member;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  }

  private mapToRequestItem(item: any, index: number): PendingRequestItem | null {
    const dateLabel = this.formatDateLabel(item?.dateRdv ?? item?.date_rdv ?? item?.dateRdv ?? item?.date);
    const timeLabel = this.formatTimeRange(
      item?.heureDebut ?? item?.heure_debut ?? item?.heureDebut,
      item?.heureFin ?? item?.heure_fin ?? item?.heureFin,
    );
    if (!dateLabel || !timeLabel) return null;

    const patientNameRaw = `${String(item?.patient?.prenom ?? item?.patientPrenom ?? item?.patient_name ?? '').trim()} ${String(item?.patient?.nom ?? item?.patientNom ?? '').trim()}`.trim();
    const patientName = patientNameRaw || 'Unknown patient';

    const specialtyLabel = String(item?.docteur?.specialiteLabel ?? item?.specialiteLabel ?? item?.specialtyLabel ?? item?.specialite ?? 'Request').trim() || 'Request';

    return {
      id: item?.id ?? index,
      patientName,
      dateLabel,
      timeLabel,
      specialtyLabel,
      badgeClass: this.getBadgeClass(index),
    };
  }

  private formatDateLabel(value: unknown): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatTimeRange(startValue: unknown, endValue: unknown): string {
    const start = this.formatTime(startValue);
    const end = this.formatTime(endValue);

    if (!start) return '';
    return end ? `${start} - ${end}` : start;
  }

  private formatTime(value: unknown): string {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';

    if (/^\d{2}:\d{2}/.test(raw)) {
      return raw.slice(0, 5);
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;

    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private getBadgeClass(index: number): string {
    const palette = [
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
      'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
      'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    ];

    return palette[index % palette.length];
  }
}