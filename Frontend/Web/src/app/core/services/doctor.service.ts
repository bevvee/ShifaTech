import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService extends ApiService {

  private base = environment.api.doctor;

  constructor() {
    super(inject(HttpClient));
  }

  getDoctors() {
    return this.get<Doctor[]>(`${this.base}/all`);
  }

  getDoctor(id: number) {
    return this.get<any>(`${this.base}/${id}`);
  }

  createDoctor(data: any) {
    return this.post(`${this.base}/c`, data);
  }

  updateDoctor(id: number, data: any) {
    return this.put(`${this.base}/${id}`, data);
  }

  deleteDoctor(id: number) {
    return this.delete(`${this.base}/${id}`);
  }

  getMyPatients() {
    return this.get<any[]>(`${this.base}/my-patients`);
  }

  getDoctorByUserId(idUser: number) {
    return this.get<any>(`${this.base}/user/${idUser}`);
  }


  // getSpecialities() {
  //   return this.get<Speciality[]>(`/speciality/all`);
  // }

}