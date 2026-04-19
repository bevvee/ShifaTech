import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VisiteDto, VisiteCreateDto } from '../../models/visite.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class VisiteApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.patient;

  getAll(): Observable<VisiteDto[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/visites`).pipe(
      map(res => res.data.map(v => this.mapToDto(v)))
    );
  }

  getAllForDoctor(): Observable<VisiteDto[]> {
    return this.http.get<ApiResponse<any[]>>(`${environment.api.doctor}/my-visits`).pipe(
      map(res => res.data.map(v => this.mapToDto(v)))
    );
  }

  getByDossierId(idDossier: number): Observable<VisiteDto[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/dossier/${idDossier}/visites`).pipe(
      map(res => res.data.map(v => this.mapToDto(v)))
    );
  }

  getById(id: number): Observable<VisiteDto> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/visites/${id}`).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  create(visite: VisiteCreateDto): Observable<VisiteDto> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/visites`, visite).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  update(id: number, visite: Partial<VisiteCreateDto>): Observable<VisiteDto> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/visites/${id}`, visite).pipe(
      map(res => this.mapToDto(res.data))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/visites/${id}`).pipe(
      map(() => undefined)
    );
  }

  private mapToDto(data: any): VisiteDto {
    return {
      ...data,
      id: data.idVisite // Map backend idVisite to frontend id
    };
  }
}
