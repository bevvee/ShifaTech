import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { PlanningDto } from '../models/planning.model';

@Injectable({
  providedIn: 'root',
})
export class PlanningService extends ApiService {
  private base = environment.api.doctor;

  constructor() {
    super(inject(HttpClient));
  }

  getByDoctor(doctorId: number) {
    return this.get<PlanningDto[]>(`${this.base}/planning/${doctorId}`);
  }

  create(dto: PlanningDto) {
    return this.post<PlanningDto>(`${this.base}/planning`, dto);
  }

  update(idPlan: number, dto: Partial<PlanningDto>) {
    return this.put<PlanningDto>(`${this.base}/planning/${idPlan}`, dto);
  }

  deletePlan(idPlan: number) {
    return super.delete<void>(`${this.base}/planning/${idPlan}`);
  }
}
