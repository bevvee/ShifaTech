export type OrdonnanceStatut = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface OrdonnanceDto {
    id: number;
    idPatient: number;
    idDoctor: number;
    idVisite?: number;

    // Pour affichage (résolu via stores)
    nomPatient?: string;
    sexePatient?: string;
    numDossier?: string;

    description: string;
    medicaments: string;
    posologie: string;
    dureeTraitement: string;
    instructions: string;
    dateValidite: string;
    statut: OrdonnanceStatut;

    dateCreation?: string;
}

export interface OrdonnanceCreateDto {
    idPatient: number;
    idDoctor: number;
    idVisite?: number;
    description: string;
    medicaments: string;
    posologie: string;
    dureeTraitement: string;
    instructions: string;
    dateValidite: string;
    statut: OrdonnanceStatut;
}
