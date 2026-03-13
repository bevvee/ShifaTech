import { Injectable, inject } from '@angular/core';
import { Observable, tap, of } from 'rxjs';
import { PatientDto, PatientCreateDto } from '../../core/models/patient.model';
import { PatientApiService } from '../../core/services/api/patient-api.service';

@Injectable({ providedIn: 'root' })
export class PatientsStore {
  private readonly api = inject(PatientApiService);
  private patients: PatientDto[] = [];

  /**
   * For components that need a quick sync list (like dropdown options),
   * we can still return the last cached list.
   * But for the main list view, we should use the API.
   */
  getCachedAll(): PatientDto[] {
    return [...this.patients];
  }

  getAll(): Observable<PatientDto[]> {
    return this.api.getAll().pipe(
      tap(data => this.patients = data)
    );
  }

  getById(id: number): Observable<PatientDto> {
    return this.api.getById(id);
  }

  // Helper for sync access when needed (e.g. navigation resolving)
  getCachedById(id: number): PatientDto | undefined {
    return this.patients.find(p => p.id === id);
  }

  create(payload: PatientCreateDto): Observable<PatientDto> {
    return this.api.create(payload).pipe(
      tap(newPatient => {
        this.patients = [newPatient, ...this.patients];
      })
    );
  }

  update(id: number, patch: Partial<PatientCreateDto>): Observable<PatientDto> {
    return this.api.update(id, patch).pipe(
      tap(updatedPatient => {
        const index = this.patients.findIndex(p => p.id === id);
        if (index !== -1) {
          this.patients[index] = updatedPatient;
        }
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => {
        this.patients = this.patients.filter(p => p.id !== id);
      })
    );
  }
}

