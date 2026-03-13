import { Injectable, inject } from '@angular/core';
import { DossierMedicalDto, DossierMedicalCreateDto } from '../../core/models/dossier-medical.model';
import { PatientsStore } from '../patients/patients.store';

@Injectable({ providedIn: 'root' })
export class DossierMedicalStore {
  private nextId = 2;
  private readonly patientsStore = inject(PatientsStore);

  private dossiers: DossierMedicalDto[] = [
    {
      id: 1,
      idPatient: 1,
      nomPatient: 'Amrani Omar',
      numDossier: 'D-0001',
      status: 'ACTIVE',
      poids: 75,
      taille: 180,
      groupeSanguin: 'O+',
      antecedentsMedicaux: 'Aucun',
      allergies: 'Pollen',
      pathologiesChroniques: 'Asthme léger',
      diagnostic: 'Bilan de santé positif',
      notes: 'Patient en bonne forme',
      dateCreation: new Date().toISOString()
    }
  ];

  getAll(): DossierMedicalDto[] {
    return [...this.dossiers];
  }

  getById(id: number): DossierMedicalDto | undefined {
    return this.dossiers.find(d => d.id === id);
  }

  getByPatientId(patientId: number): DossierMedicalDto | undefined {
    return this.dossiers.find(d => d.idPatient === patientId);
  }

  create(payload: DossierMedicalCreateDto): DossierMedicalDto {
    const id = this.nextId++;
    const patient = this.patientsStore.getCachedById(payload.idPatient);
    
    const newDossier: DossierMedicalDto = {
      id,
      ...payload,
      nomPatient: patient ? `${patient.nom} ${patient.prenom}` : 'Patient Inconnu',
      numDossier: patient ? patient.numDossier : `D-${String(id).padStart(4, '0')}`,
      dateCreation: new Date().toISOString()
    };
    this.dossiers = [newDossier, ...this.dossiers];
    return newDossier;
  }

  update(id: number, patch: Partial<DossierMedicalCreateDto>): boolean {
    const index = this.dossiers.findIndex(d => d.id === id);
    if (index === -1) return false;

    const current = this.dossiers[index];
    const patientId = patch.idPatient ?? current.idPatient;
    const patient = this.patientsStore.getCachedById(patientId);

    this.dossiers[index] = {
      ...current,
      ...patch,
      nomPatient: patient ? `${patient.nom} ${patient.prenom}` : current.nomPatient,
      numDossier: patient ? patient.numDossier : current.numDossier,
    };
    return true;
  }

  delete(id: number): void {
    this.dossiers = this.dossiers.filter(d => d.id !== id);
  }
}
