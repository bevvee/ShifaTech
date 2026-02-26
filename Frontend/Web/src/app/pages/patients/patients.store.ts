import { Injectable } from '@angular/core';

export type Sexe = 'M' | 'F';

export type PatientRow = {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  role: 'PATIENT';
  sexe: Sexe;
  statut: boolean;
  dateNaissance: string;
  telephone: string;
  adresse: string;

  idUser: number;
  numDossier: string;
  poids: number;
};

@Injectable({ providedIn: 'root' })
export class PatientsStore {
  private nextId = 2;

  patients: PatientRow[] = [
    {
      id: 1,
      nom: 'Amrani',
      prenom: 'Omar',
      cin: 'PA123456',
      email: 'omar.amrani@shifatech.test',
      role: 'PATIENT',
      sexe: 'M',
      statut: true,
      dateNaissance: '1998-06-05',
      telephone: '+212633333333',
      adresse: 'Tanger',
      idUser: 1,
      numDossier: 'D-0001',
      poids: 72,
    },
  ];

  getById(id: number): PatientRow | undefined {
    return this.patients.find((p) => p.id === id);
  }

  create(payload: Omit<PatientRow, 'id' | 'idUser' | 'numDossier' | 'poids'>): PatientRow {
    const id = this.nextId++;
    const row: PatientRow = {
      id,
      ...payload,
      idUser: id,
      numDossier: `D-${String(id).padStart(4, '0')}`,
      poids: 0,
    };
    this.patients = [row, ...this.patients];
    return row;
  }

  update(id: number, patch: Omit<PatientRow, 'id' | 'idUser' | 'numDossier' | 'poids'>): boolean {
    const existing = this.getById(id);
    if (!existing) return false;

    const updated: PatientRow = {
      ...existing,
      ...patch,
    };

    this.patients = this.patients.map((p) => (p.id === id ? updated : p));
    return true;
  }

  delete(id: number): void {
    this.patients = this.patients.filter((p) => p.id !== id);
  }
}
