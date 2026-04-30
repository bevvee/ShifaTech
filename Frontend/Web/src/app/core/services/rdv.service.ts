import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { RdvCreateDto } from '../models/rdv.model';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RdvService extends ApiService {

  private base = environment.api.rdv;
  private baseViewList = '/rdv/api/rendez-vous-view';
  private baseViewCurrent = '/rdv/api/rendez-vous-view/current';

  getAll(): Observable<any>;
  getAll(params: Record<string, string | number | boolean | null | undefined>): Observable<any>;
  getAll(params?: Record<string, string | number | boolean | null | undefined>) {
    if (!params) {
      return this.get<any>(`${this.base}`);
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;
      httpParams = httpParams.set(key, String(value));
    }

    return this.http.get<any>(`${this.base}`, { params: httpParams });
  }

  getById(id: number) {
    return this.get<RdvCreateDto>(`${this.base}/${id}`);
  }

  create(data: RdvCreateDto) {
    return this.post<RdvCreateDto>(`${this.base}`, data);
  }

  update(id: number, data: RdvCreateDto) {
    return this.put<RdvCreateDto>(`${this.base}/${id}`, data);
  }

  deleteById(id: number) {
    return super.delete(`${this.base}/${id}`);
  }

  getRendezVousViewList(): Observable<any>;
  getRendezVousViewList(params: Record<string, string | number | boolean | null | undefined>): Observable<any>;
  getRendezVousViewList(params?: Record<string, string | number | boolean | null | undefined>) {
    if (!params) {
      return this.get<any>(`${this.baseViewList}`);
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;
      httpParams = httpParams.set(key, String(value));
    }

    return this.http.get<any>(`${this.baseViewList}`, { params: httpParams });
  }

  getRendezVousViewCurrent(): Observable<any>;
  getRendezVousViewCurrent(params: Record<string, string | number | boolean | null | undefined>): Observable<any>;
  getRendezVousViewCurrent(params?: Record<string, string | number | boolean | null | undefined>) {
    if (!params) {
      return this.get<any>(`${this.baseViewCurrent}`);
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;
      httpParams = httpParams.set(key, String(value));
    }

    return this.http.get<any>(`${this.baseViewCurrent}`, { params: httpParams });
  }
}