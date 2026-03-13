export type DossierStatus = 'ACTIVE' | 'ARCHIVED' | 'DECEASED';
export type GroupeSanguin = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface DossierMedicalDto {
    id: number;
    idPatient: number;
    // Nom du patient (pour affichage — résolu via PatientsStore)
    nomPatient?: string;
    numDossier?: string;

    status: DossierStatus;
    poids: number;
    taille: number;
    groupeSanguin: GroupeSanguin;
    antecedentsMedicaux: string;
    allergies: string;
    pathologiesChroniques: string;
    diagnostic: string;
    notes: string;

    dateCreation: string;
    dateFermeture?: string;
}

export interface DossierMedicalCreateDto {
    idPatient: number;
    status: DossierStatus;
    poids: number;
    taille: number;
    groupeSanguin: GroupeSanguin;
    antecedentsMedicaux: string;
    allergies: string;
    pathologiesChroniques: string;
    diagnostic: string;
    notes: string;
}
