import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { PatientRow, PatientsStore } from './patients.store';

@Component({
  selector: 'app-patients',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './patients.component.html',
  styles: ``
})
export class PatientsComponent {
  searchTerm = '';

  constructor(
    private readonly router: Router,
    private readonly store: PatientsStore,
  ) {}

  viewPatient(id: number) {
    this.router.navigate(['/patients', id]);
  }

  editPatient(id: number) {
    this.router.navigate(['/patients', id, 'edit']);
  }

  deletePatient(id: number) {
    this.store.delete(id);
  }

  getInitials(row: PatientRow): string {
    const nom = row.nom?.trim() ?? '';
    const prenom = row.prenom?.trim() ?? '';
    const first = nom.length > 0 ? nom[0] : '';
    const second = prenom.length > 0 ? prenom[0] : '';
    const initials = `${first}${second}`.toUpperCase();
    return initials || '?';
  }

  get filteredPatients(): PatientRow[] {
    const q = this.searchTerm.trim().toLowerCase();
    const patients = this.store.patients;
    if (!q) return patients;

    return patients.filter((p) => {
      const haystack = [
        p.nom,
        p.prenom,
        p.cin,
        p.email,
        p.telephone,
        p.adresse,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

}
