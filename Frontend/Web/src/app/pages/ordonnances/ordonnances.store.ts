import { Injectable, inject } from '@angular/core';
import { OrdonnanceDto, OrdonnanceCreateDto } from '../../core/models/ordonnance.model';
import { OrdonnanceApiService } from '../../core/services/api/ordonnance-api.service';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrdonnanceStore {
  private readonly ordonnanceApi = inject(OrdonnanceApiService);

  getAll(idDoctor?: number | number[]): Observable<OrdonnanceDto[]> {
    return this.ordonnanceApi.getAll(idDoctor);
  }

  getById(id: number): Observable<OrdonnanceDto | undefined> {
    return this.ordonnanceApi.getById(id);
  }

  getByPatientId(patientId: number): Observable<OrdonnanceDto[]> {
    return this.ordonnanceApi.getByPatientId(patientId);
  }

  create(payload: OrdonnanceCreateDto): Observable<OrdonnanceDto> {
    return this.ordonnanceApi.create(payload);
  }

  update(id: number, patch: Partial<OrdonnanceCreateDto>): Observable<boolean> {
    return this.ordonnanceApi.update(id, patch).pipe(map(() => true));
  }

  delete(id: number): Observable<void> {
    return this.ordonnanceApi.delete(id);
  }
}
