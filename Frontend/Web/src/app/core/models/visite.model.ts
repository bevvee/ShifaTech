export type VisiteStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface VisiteDto {
    id: number;
    idDossier: number;
    idDoctor: number;

    // Pour affichage (résolu via stores)
    nomPatient?: string;
    numDossier?: string;

    status: VisiteStatus;
    planTraitement: string;
    observations: string;

    dateCreation: string;
    dateFermeture?: string;
}

export interface VisiteCreateDto {
    idDossier: number;
    idDoctor: number;
    status: VisiteStatus;
    planTraitement: string;
    observations: string;
}
