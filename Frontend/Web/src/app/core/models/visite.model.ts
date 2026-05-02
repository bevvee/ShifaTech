export type VisiteStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface VisiteDto {
    id: number;
    idDossier: number;
    idDoctor: number;
    idBodyPart?: number | null;

    // Pour affichage (résolu via stores)
    nomPatient?: string;
    numDossier?: string;

    status: VisiteStatus;
    typeVisite?: 'CONSULTATION' | 'BLESSURE';
    typeBlessure?: string;
    bodyParts?: string; // Codes des zones corporelles séparés par virgule (ex: "ARM_L,LEG_R")
    planTraitement: string;
    observations: string;
    overlayUrl?: string;
    maskUrl?: string;
    originalImageUrl?: string;

    dateCreation: string;
    dateFermeture?: string;
}

export interface VisiteCreateDto {
    idDossier: number;
    idDoctor: number;
    status: VisiteStatus;
    typeVisite: 'CONSULTATION' | 'BLESSURE';
    typeBlessure?: string | null;
    bodyParts?: string | null; // Codes joints par virgule
    idBodyPart?: number | null;
    planTraitement: string;
    observations: string;
    overlayUrl?: string;
    maskUrl?: string;
    originalImageUrl?: string;
}
