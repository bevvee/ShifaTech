import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfirmierService extends ApiService {

  private base = environment.api.infirmier;
  private authBase = environment.api.auth;
  private specialiteBase = environment.api.infirmierSpecialite;

  constructor() {
    super(inject(HttpClient));
  }

  getAll() {
    return this.get<any>(`${this.base}`);
  }

  getById(id: number) {
    return this.get<any>(`${this.base}/${id}`);
  }

  create(dto: any) {
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
        return this.post<any>(`${this.base}`, {
          id_utilisateur: userId,
          id_specialite: dto.idSpecialite,
          id_service: dto.id_service ?? 1,
          statut: dto.statut ?? true,
        });
      })
    );
  }

  update(id: number, dto: any) {
    return this.put<any>(`${this.base}/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete(`${this.base}/${id}`);
  }

  getSpecialites() {
    return this.get<any>(`${this.specialiteBase}`);
  }
}