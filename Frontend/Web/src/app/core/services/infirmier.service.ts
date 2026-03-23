import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { InfirmierCreateDto, InfirmierDto, InfirmierUpdateDto } from '../models/infirmier.model';
import { switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InfirmierService extends ApiService {

    private base = environment.api.infirmier;
    private authBase = environment.api.auth;
    private specialiteBase = environment.api.infirmierSpecialite

    getAll(idSpecialite: string = '') {
      const url = idSpecialite 
        ? `${this.base}?id_specialite=${idSpecialite}`
        : `${this.base}`;
      return this.get<any>(url);
    }

    getById(id: number) {
        return this.get<InfirmierDto>(`${this.base}/${id}`);
    }

    create(dto: InfirmierCreateDto) {
        const registerPayload = {
            nom: dto.nom,
            prenom: dto.prenom,
            cin: dto.cin,
            email: dto.email,
            password: dto.password,
            passwordConfirmation: dto.password,
            role: 'INFIRMIER',
            sexe: dto.sexe,
            dateNaissance: dto.dateNaissance,
            telephone: dto.telephone,
            adresse: dto.adresse,
        };

        return this.post<any>(`${this.authBase}/register`, registerPayload).pipe(
            switchMap((authResponse: any) => {
                const userId = authResponse?.user?.idUser;
                return this.post<InfirmierDto>(`${this.base}`, {
                    id_utilisateur: userId,
                    id_specialite: `/api/infirmier_specialites/${dto.idSpecialite}`,
                });
            })
        );
    }

    update(id: number, dto: InfirmierUpdateDto) {
        console.log('update appelé URL:', `${this.base}/${id}`);
        return this.put<InfirmierDto>(`${this.base}/${id}`, dto);
    }

    deleteById(id: number) {
        return this.delete<void>(`${this.base}/${id}`);
    }
    getSpecialites() {
        return this.get<any>(`${this.specialiteBase}`);
    }
}