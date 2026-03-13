import { Injectable, inject } from '@angular/core';
import { VisiteDto, VisiteCreateDto } from '../../core/models/visite.model';
import { DossierMedicalStore } from '../dossier-medical/dossier-medical.store';

@Injectable({ providedIn: 'root' })
export class VisiteStore {
  private nextId = 2;
  private readonly dossierStore = inject(DossierMedicalStore);

  private visites: VisiteDto[] = [
    {
      id: 1,
      idDossier: 1,
      idDoctor: 1,
      nomPatient: 'Amrani Omar',
      numDossier: 'D-0001',
      status: 'OPEN',
      planTraitement: 'Repos et hydratation',
      observations: 'Léger rhume',
      dateCreation: new Date().toISOString()
    }
  ];

  getAll(): VisiteDto[] {
    return [...this.visites];
  }

  getById(id: number): VisiteDto | undefined {
    return this.visites.find(v => v.id === id);
  }

  getByDossierId(dossierId: number): VisiteDto[] {
    return this.visites.filter(v => v.idDossier === dossierId);
  }

  create(payload: VisiteCreateDto): VisiteDto {
    const id = this.nextId++;
    const dossier = this.dossierStore.getById(payload.idDossier);

    const newVisite: VisiteDto = {
      id,
      ...payload,
      nomPatient: dossier ? dossier.nomPatient : 'Patient Mock',
      numDossier: dossier ? dossier.numDossier : 'D-000X',
      dateCreation: new Date().toISOString()
    };
    this.visites = [newVisite, ...this.visites];
    return newVisite;
  }

  update(id: number, patch: Partial<VisiteCreateDto>): boolean {
    const index = this.visites.findIndex(v => v.id === id);
    if (index === -1) return false;

    const current = this.visites[index];
    const dossierId = patch.idDossier ?? current.idDossier;
    const dossier = this.dossierStore.getById(dossierId);

    this.visites[index] = {
      ...current,
      ...patch,
      nomPatient: dossier ? dossier.nomPatient : current.nomPatient,
      numDossier: dossier ? dossier.numDossier : current.numDossier,
    };
    return true;
  }

  delete(id: number): void {
    this.visites = this.visites.filter(v => v.id !== id);
  }
}
