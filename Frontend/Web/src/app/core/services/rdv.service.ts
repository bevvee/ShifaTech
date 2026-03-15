import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { RdvCreateDto } from '../models/rdv.model';

@Injectable({
  providedIn: 'root'
})
export class RdvService extends ApiService {

  private base = environment.api.rdv;

  getAll() {
    return this.get<any>(`${this.base}`);
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
}