import { Injectable, inject } from '@angular/core';
import { DossierMedicalDto, DossierMedicalCreateDto } from '../../core/models/dossier-medical.model';
import { PatientsStore } from '../patients/patients.store';
import { DossierApiService } from '../../core/services/api/dossier-api.service';
import { Observable, tap, of, map, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DossierMedicalStore {
  /*
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
  */

  private readonly api = inject(DossierApiService);
  private readonly patientsStore = inject(PatientsStore);
  private dossiers: DossierMedicalDto[] = [];

  /*
  getAll(): DossierMedicalDto[] {
    return [...this.dossiers];
  }

  getById(id: number): DossierMedicalDto | undefined {
    return this.dossiers.find(d => d.id === id);
  }

  getByPatientId(patientId: number): DossierMedicalDto | undefined {
    return this.dossiers.find(d => d.idPatient === patientId);
  }
  */

  getAll(): Observable<DossierMedicalDto[]> {
    return this.api.getAll().pipe(
      tap(data => this.dossiers = data)
    );
  }

  getAllForDoctor(): Observable<DossierMedicalDto[]> {
    return this.api.getAllForDoctor().pipe(
      tap(data => this.dossiers = data)
    );
  }

  getById(id: number): Observable<DossierMedicalDto> {
    // Note: Le backend n'a pas de getById spécifique, on utilise souvent getByPatientId
    return this.api.getAll().pipe(
      map(list => list.find(d => d.id === id)!)
    );
  }

  getByPatientId(patientId: number): Observable<DossierMedicalDto> {
    return this.api.getByIdPatient(patientId);
  }

  /*
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
  */

  create(payload: DossierMedicalCreateDto): Observable<DossierMedicalDto> {
    return this.api.create(payload).pipe(
      tap(newDossier => {
        this.dossiers = [newDossier, ...this.dossiers];
      })
    );
  }

  update(id: number, patch: Partial<DossierMedicalCreateDto>, idPatient?: number): Observable<DossierMedicalDto> {
    const actualIdPatient = idPatient ?? Number(patch.idPatient);
    
    // Si on a l'idPatient directement (passé en argument ou dans le patch)
    if (actualIdPatient && !isNaN(actualIdPatient)) {
      return this.api.update(actualIdPatient, patch).pipe(
        tap(updatedDossier => {
          const index = this.dossiers.findIndex(d => d.id === id);
          if (index !== -1) {
            this.dossiers[index] = updatedDossier;
          }
        })
      );
    }

    // Sinon on tente de le trouver dans le cache (ancien comportement)
    const dossier = this.dossiers.find(d => d.id === id);
    if (!dossier) {
      // Cas extrême: on doit fetch la liste pour retrouver le dossier
      return this.api.getAll().pipe(
        map(list => list.find(d => d.id === id)),
        tap(found => { if (!found) throw new Error('Dossier non trouvé sur le serveur'); }),
        map(found => found!),
        switchMap(found => {
          this.dossiers = [found, ...this.dossiers];
          return this.update(id, patch);
        })
      );
    }

    return this.api.update(dossier.idPatient, patch).pipe(
      tap(updatedDossier => {
        const index = this.dossiers.findIndex(d => d.id === id);
        if (index !== -1) {
          this.dossiers[index] = updatedDossier;
        }
      })
    );
  }

  deleteByPatientId(idPatient: number): Observable<void> {
    return this.api.delete(idPatient).pipe(
      tap(() => {
        this.dossiers = this.dossiers.filter(d => d.idPatient !== idPatient);
      })
    );
  }

  delete(id: number): Observable<void> {
    const dossier = this.dossiers.find(d => d.id === id);
    if (dossier) {
       return this.deleteByPatientId(dossier.idPatient);
    }
    // Si non trouvé en cache, on ne peut pas deviner l'idPatient sans fetch
    return this.getAll().pipe(
      map(list => list.find(d => d.id === id)),
      tap(found => { if (!found) throw new Error('Dossier non trouvé'); }),
      map(found => found!),
      switchMap(found => this.deleteByPatientId(found.idPatient))
    );
  }
}
