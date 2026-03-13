import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PatientDto, PatientCreateDto } from '../../models/patient.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PatientApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.patient;

  getAll(): Observable<PatientDto[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/`).pipe(
      map(res => res.data.map(p => this.mapToDto(p)))
    );
  }

  getById(id: number): Observable<PatientDto> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  create(patient: PatientCreateDto): Observable<PatientDto> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/`, patient).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  update(id: number, patient: Partial<PatientCreateDto>): Observable<PatientDto> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, patient).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }

  private mapToDto(data: any): PatientDto {
    return {
      ...data,
      id: data.idPatient // Map backend idPatient to frontend id
    };
  }
}
