import { Injectable, inject } from '@angular/core';
import { OrdonnanceDto, OrdonnanceCreateDto } from '../../core/models/ordonnance.model';
import { PatientsStore } from '../patients/patients.store';

@Injectable({ providedIn: 'root' })
export class OrdonnanceStore {
  private nextId = 2;
  private readonly patientsStore = inject(PatientsStore);

  private ordonnances: OrdonnanceDto[] = [
    {
      id: 1,
      idPatient: 1,
      idDoctor: 1,
      idVisite: 1,
      nomPatient: 'Amrani Omar',
      numDossier: 'D-0001',
      description: 'Traitement rhume',
      medicaments: 'Paracétamol, Vitamine C',
      posologie: '1 comprimé 3 fois par jour',
      dureeTraitement: '5 jours',
      instructions: 'À prendre après les repas',
      dateValidite: '2026-12-31',
      statut: 'ACTIVE',
      dateCreation: new Date().toISOString()
    }
  ];

  getAll(): OrdonnanceDto[] {
    return [...this.ordonnances];
  }

  getById(id: number): OrdonnanceDto | undefined {
    return this.ordonnances.find(o => o.id === id);
  }

  getByPatientId(patientId: number): OrdonnanceDto[] {
    return this.ordonnances.filter(o => o.idPatient === patientId);
  }

  create(payload: OrdonnanceCreateDto): OrdonnanceDto {
    const id = this.nextId++;
    const patient = this.patientsStore.getCachedById(payload.idPatient);

    const newOrdonnance: OrdonnanceDto = {
      id,
      ...payload,
      nomPatient: patient ? `${patient.nom} ${patient.prenom}` : 'Patient Mock',
      numDossier: patient ? patient.numDossier : 'D-000X',
      dateCreation: new Date().toISOString()
    };
    this.ordonnances = [newOrdonnance, ...this.ordonnances];
    return newOrdonnance;
  }

  update(id: number, patch: Partial<OrdonnanceCreateDto>): boolean {
    const index = this.ordonnances.findIndex(o => o.id === id);
    if (index === -1) return false;

    const current = this.ordonnances[index];
    const patientId = patch.idPatient ?? current.idPatient;
    const patient = this.patientsStore.getCachedById(patientId);

    this.ordonnances[index] = {
      ...current,
      ...patch,
      nomPatient: patient ? `${patient.nom} ${patient.prenom}` : current.nomPatient,
      numDossier: patient ? patient.numDossier : current.numDossier,
    };
    return true;
  }

  delete(id: number): void {
    this.ordonnances = this.ordonnances.filter(o => o.id !== id);
  }
}
