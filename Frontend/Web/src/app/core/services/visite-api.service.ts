import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VisiteDto, VisiteCreateDto } from '../models/visite.model';
const BASE = '/infirmier/api';

@Injectable({ providedIn: 'root' })
export class VisiteApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<VisiteDto[]> {
    return this.http.get<any>(`${BASE}/visites`).pipe(
      map(res => this.extractList(res).map(v => this.map(v)))
    );
  }

  getById(id: number): Observable<VisiteDto> {
    return this.http.get<any>(`${BASE}/visites/${id}`).pipe(
      map(v => this.map(v))
    );
  }

  getByDossierId(dossierId: number): Observable<VisiteDto[]> {
    return this.http.get<any>(`${BASE}/dossier/${dossierId}/visites`).pipe(
      map(res => this.extractList(res).map(v => this.map(v)))
    );
  }

  create(payload: VisiteCreateDto): Observable<VisiteDto> {
    return this.http.post<any>(`${BASE}/visites`, payload).pipe(
      map(v => this.map(v))
    );
  }

  update(id: number, patch: Partial<VisiteCreateDto>): Observable<VisiteDto> {
    return this.http.put<any>(`${BASE}/visites/${id}`, patch).pipe(
      map(v => this.map(v))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/visites/${id}`);
  }

  // Gère les 3 formats possibles : tableau brut, Hydra, ou { data: [] }
  private extractList(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res?.['hydra:member']) return res['hydra:member'];
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private map(v: any): VisiteDto {
    return {
      id:             v.id            ?? v.idVisite    ?? null,
      idDoctor:       v.idDoctor                       ?? null,
      idDossier:      v.idDossier                      ?? null,
      status:         v.status                         ?? 'OPEN',
      planTraitement: v.planTraitement                 ?? '',
      observations:   v.observations                  ?? '',
      dateCreation:   v.dateCreation                   ?? null,
      dateFermeture:  v.dateFermeture                  ?? null,
      nomPatient:     v.nomPatient    ?? v.patientNom  ?? '',
      numDossier:     v.numDossier    ?? v.dossierNum  ?? '',
    };
  }
}