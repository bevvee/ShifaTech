import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrdonnanceDto, OrdonnanceCreateDto } from '../../models/ordonnance.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class OrdonnanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.patient;

  getAll(): Observable<OrdonnanceDto[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/ordonnances`).pipe(
      map(res => res.data.map(o => this.mapToDto(o)))
    );
  }

  getByPatientId(idPatient: number): Observable<OrdonnanceDto[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${idPatient}/ordonnances`).pipe(
      map(res => res.data.map(o => this.mapToDto(o)))
    );
  }

  getById(id: number): Observable<OrdonnanceDto> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/ordonnances/${id}`).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  create(ordonnance: OrdonnanceCreateDto): Observable<OrdonnanceDto> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/ordonnances`, ordonnance).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  update(id: number, ordonnance: Partial<OrdonnanceCreateDto>): Observable<OrdonnanceDto> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/ordonnances/${id}`, ordonnance).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/ordonnances/${id}`).pipe(
      map(() => undefined)
    );
  }

  private mapToDto(data: any): OrdonnanceDto {
    return {
      ...data,
      id: data.idOrdonnance // Map backend idOrdonnance to frontend id
    };
  }
}
