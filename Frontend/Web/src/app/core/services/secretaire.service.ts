// Secretaire Service - Manages secretaire (secretary) operations
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { switchMap, tap, catchError, throwError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SecretaireService extends ApiService {

  private authBase = environment.api.auth;
  private secretaireBase = `${this.authBase}/api/secretaires`;

  constructor() {
    super(inject(HttpClient));
  }

  getAll() {
    return this.get<any>(`${this.secretaireBase}`);
  }

  getById(id: number) {
    return this.get<any>(`${this.secretaireBase}/${id}`);
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

    let createdUserId: number | null = null;

    return this.post<any>(`${this.authBase}/register`, registerPayload).pipe(
      tap((authResponse: any) => {
        createdUserId = authResponse?.user?.idUser ?? null;
      }),
      switchMap((authResponse: any) => {
        const userId = authResponse?.user?.idUser;
        return this.post<any>(`${this.secretaireBase}`, {
          id_utilisateur: userId,
          statut: dto.statut ?? true,
        });
      }),
      catchError((err) => {
        if (createdUserId !== null) {
          const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
          const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
          return this.http.delete(`${this.authBase}/delete/${createdUserId}`, { headers }).pipe(
            catchError(() => of(null)),
            switchMap(() => throwError(() => err))
          );
        }
        return throwError(() => err);
      })
    );
  }

  update(id: number, dto: any) {
    return this.put<any>(`${this.secretaireBase}/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete(`${this.secretaireBase}/${id}`);
  }
}
