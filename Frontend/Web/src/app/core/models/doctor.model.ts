import { Sexe } from './sexe.enum';

export interface Doctor {
    idDocteur: number;
    idUser: number;
    nom: string;
    prenom: string;
    cin: string;
    email: string;
    sexe: Sexe;
    statut: boolean;
    dateNaissance: string;
    telephone: string;
    adresse: string;
    numeroOrdre: string;
    idSpecialite: number;
    specialiteLabel: string;
}

export interface DoctorCreatePayload extends Omit<Doctor, 'idDocteur' | 'specialiteLabel'> {
    password?: string;
}
