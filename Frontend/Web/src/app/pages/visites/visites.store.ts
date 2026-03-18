import { Injectable, inject } from '@angular/core';
import { VisiteDto, VisiteCreateDto } from '../../core/models/visite.model';
import { VisiteApiService } from '../../core/services/api/visite-api.service';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisiteStore {
  private readonly visiteApi = inject(VisiteApiService);

  getAll(): Observable<VisiteDto[]> {
    return this.visiteApi.getAll();
  }

  getById(id: number): Observable<VisiteDto | undefined> {
    return this.visiteApi.getById(id);
  }

  getByDossierId(dossierId: number): Observable<VisiteDto[]> {
    return this.visiteApi.getByDossierId(dossierId);
  }

  create(payload: VisiteCreateDto): Observable<VisiteDto> {
    return this.visiteApi.create(payload);
  }

  update(id: number, patch: Partial<VisiteCreateDto>): Observable<boolean> {
    return this.visiteApi.update(id, patch).pipe(map(() => true));
  }

  delete(id: number): Observable<void> {
    return this.visiteApi.delete(id);
  }
}
