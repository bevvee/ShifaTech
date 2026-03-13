import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { Speciality } from '../models/speciality.model';

@Injectable({
    providedIn: 'root'
})
export class SpecialityService extends ApiService {

    private base = environment.api.doctor + '/speciality';

    constructor() {
        super(inject(HttpClient));
    }

    getSpecialities() {
        return this.get<Speciality[]>(`${this.base}/all`);
    }

    getSpeciality(id: number) {
        return this.get<Speciality>(`${this.base}/${id}`);
    }

    createSpeciality(data: Partial<Speciality>) {
        return this.post<Speciality>(`${this.base}`, data);
    }

    updateSpeciality(id: number, data: Partial<Speciality>) {
        return this.put<Speciality>(`${this.base}/${id}`, data);
    }

    deleteSpeciality(id: number) {
        return this.delete(`${this.base}/${id}`);
    }
}
