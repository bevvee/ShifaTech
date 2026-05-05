export type Sexe = 'M' | 'F';

export interface SecretaireDto {
    id: number;
    nom: string;
    prenom: string;
    cin: string;
    email: string;
    role: 'SECRETAIRE';
    sexe: Sexe;
    statut: boolean;
    dateNaissance: string;
    telephone: string;
    adresse: string;
    id_utilisateur: number;
}

export interface SecretaireCreateDto {
    nom: string;
    prenom: string;
    cin: string;
    email: string;
    password: string;
    sexe: Sexe;
    statut?: boolean;
    dateNaissance: string;
    telephone: string;
    adresse: string;
}

export interface SecretaireUpdateDto {
    nom?: string;
    prenom?: string;
    cin?: string;
    email?: string;
    password?: string;
    sexe?: Sexe;
    statut?: boolean;
    dateNaissance?: string;
    telephone?: string;
    adresse?: string;
}
