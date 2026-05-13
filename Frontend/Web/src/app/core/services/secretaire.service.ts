// Secretaire Service - Manages secretaire (secretary) operations
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SecretaireService extends ApiService {

  private authBase = environment.api.auth;

  constructor() {
    super(inject(HttpClient));
  }

  getAll() {
    return this.get<any[]>(`${this.authBase}/users/role/SECRETAIRE`).pipe(
      map((users) => (Array.isArray(users) ? users : []).map((u) => this.normalizeUser(u)))
    );
  }

  getById(id: number) {
    return this.get<any>(`${this.authBase}/user/${id}`).pipe(
      map((response) => this.normalizeUser(response?.user ?? response))
    );
  }

  create(dto: any) {
    const registerPayload = {
      nom: dto.nom,
      prenom: dto.prenom,
      cin: dto.cin,
      email: dto.email,
      password: dto.password,
      passwordConfirmation: dto.password,
      role: 'SECRETAIRE',
      sexe: dto.sexe,
      dateNaissance: dto.dateNaissance,
      telephone: dto.telephone,
      adresse: dto.adresse,
    };

    return this.post<any>(`${this.authBase}/register`, registerPayload);
  }

  update(id: number, dto: any) {
    const payload = {
      nom: dto.nom,
      prenom: dto.prenom,
      cin: dto.cin,
      email: dto.email,
      motDePasse: dto.password,
      sexe: dto.sexe,
      dateNaissance: dto.dateNaissance,
      telephone: dto.telephone,
      adresse: dto.adresse,
    };

    return this.put<any>(`${this.authBase}/update/${id}`, payload);
  }

  deleteById(id: number) {
    return this.delete(`${this.authBase}/delete/${id}`);
  }

  private normalizeUser(raw: any) {
    return {
      ...raw,
      id: raw?.id ?? raw?.idUser,
      id_utilisateur: raw?.id ?? raw?.idUser,
    };
  }
}
