import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DossierMedicalDto, DossierMedicalCreateDto } from '../../models/dossier-medical.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DossierApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.patient;

  getAll(): Observable<DossierMedicalDto[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/dossiers`).pipe(
      map(res => res.data.map(d => this.mapToDto(d)))
    );
  }

  getAllForDoctor(): Observable<DossierMedicalDto[]> {
    return this.http.get<ApiResponse<any[]>>(`${environment.api.doctor}/my-medical-records`).pipe(
      map(res => res.data.map(d => this.mapToDto(d)))
    );
  }

  getByIdPatient(idPatient: number): Observable<DossierMedicalDto> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${idPatient}/dossier-medical`).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  create(dossier: DossierMedicalCreateDto): Observable<DossierMedicalDto> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/dossier-medical`, dossier).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  update(idPatient: number, dossier: Partial<DossierMedicalCreateDto>): Observable<DossierMedicalDto> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${idPatient}/dossier-medical`, dossier).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  delete(idPatient: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${idPatient}/dossier-medical`).pipe(
      map(() => undefined)
    );
  }

  private mapToDto(data: any): DossierMedicalDto {
    return {
      ...data,
      id: data.idDossier // Map backend idDossier to frontend id
    };
  }
}
