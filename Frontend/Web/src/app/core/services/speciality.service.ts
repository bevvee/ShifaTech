import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { Speciality } from '../models/speciality.model';
import { map } from 'rxjs/operators';

export type SpecialityOwner = 'doctor' | 'infirmier';

@Injectable({
    providedIn: 'root'
})
export class SpecialityService extends ApiService {

    private doctorBase = environment.api.doctor + '/speciality';
    private infirmierBase = environment.api.infirmier + '/infirmier_specialites';

    constructor() {
        super(inject(HttpClient));
    }

    getSpecialities(owner: SpecialityOwner = 'doctor') {
        if (owner === 'doctor') {
            return this.get<Speciality[]>(`${this.doctorBase}/all`);
        }

        return this.get<unknown>(`${this.infirmierBase}`).pipe(
            map((resp) => this.unwrapCollection(resp).map((raw) => this.mapInfirmierSpeciality(raw)))
        );
    }

    getSpeciality(id: number, owner: SpecialityOwner = 'doctor') {
        if (owner === 'doctor') {
            return this.get<Speciality>(`${this.doctorBase}/${id}`);
        }

        return this.get<unknown>(`${this.infirmierBase}/${id}`).pipe(
            map((raw) => this.mapInfirmierSpeciality(raw))
        );
    }

    createSpeciality(data: Partial<Speciality>, owner: SpecialityOwner = 'doctor') {
        if (owner === 'doctor') {
            return this.post<Speciality>(`${this.doctorBase}`, data);
        }

        const body: any = {
            label: data.label,
            idService: data.idService ?? null,
        };

        return this.post<unknown>(`${this.infirmierBase}`, body).pipe(
            map((raw) => this.mapInfirmierSpeciality(raw))
        );
    }

    updateSpeciality(id: number, data: Partial<Speciality>, owner: SpecialityOwner = 'doctor') {
        if (owner === 'doctor') {
            return this.put<Speciality>(`${this.doctorBase}/${id}`, data);
        }

        const body: any = {
            label: data.label,
            idService: data.idService ?? null,
        };

        return this.put<unknown>(`${this.infirmierBase}/${id}`, body).pipe(
            map((raw) => this.mapInfirmierSpeciality(raw))
        );
    }

    deleteSpeciality(id: number, owner: SpecialityOwner = 'doctor') {
        if (owner === 'doctor') {
            return this.delete(`${this.doctorBase}/${id}`);
        }

        return this.delete(`${this.infirmierBase}/${id}`);
    }

    private unwrapCollection(resp: unknown): any[] {
        if (Array.isArray(resp)) return resp;
        if (resp && typeof resp === 'object') {
            const anyResp: any = resp;
            const hydra = anyResp['hydra:member'];
            if (Array.isArray(hydra)) return hydra;
        }
        return [];
    }

    private mapInfirmierSpeciality(raw: any): Speciality {
        const id = Number(raw?.id ?? raw?.idSpecialite ?? raw?.id_specialite ?? 0);
        const label = String(raw?.label ?? '');
        const idServiceRaw = raw?.idService ?? raw?.id_service ?? null;
        const idServiceNum = idServiceRaw == null || idServiceRaw === '' ? null : Number(idServiceRaw);

        return {
            idSpecialite: id,
            label,
            idService: idServiceNum != null && Number.isFinite(idServiceNum) ? idServiceNum : null,
        };
    }
}
