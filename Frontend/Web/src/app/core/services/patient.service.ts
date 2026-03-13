import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { PatientDto, PatientCreateDto } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService extends ApiService {

  private base = environment.api.patient;

  getAll() {
    return this.get<PatientDto[]>(`${this.base}`);
  }

  getById(id: number) {
    return this.get<PatientDto>(`${this.base}/${id}`);
  }

  create(dto: PatientCreateDto) {
    return this.post<PatientDto>(`${this.base}`, dto);
  }

  update(id: number, dto: PatientCreateDto) {
    return this.put<PatientDto>(`${this.base}/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete(`${this.base}/${id}`);
  }

}