export type VisiteStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface VisiteDto {
    id: number;
    idDossier: number;
    idDoctor: number;

    // Pour affichage (résolu via stores)
    nomPatient?: string;
    numDossier?: string;

    status: VisiteStatus;
    typeVisite?: 'CONSULTATION' | 'BLESSURE';
    typeBlessure?: string;
    idBodyPart?: number;
    planTraitement: string;
    observations: string;

    dateCreation: string;
    dateFermeture?: string;
}

export interface VisiteCreateDto {
    idDossier: number;
    idDoctor: number;
    status: VisiteStatus;
    typeVisite: 'CONSULTATION' | 'BLESSURE';
    typeBlessure?: string | null;
    idBodyPart?: number | null;
    planTraitement: string;
    observations: string;
}
