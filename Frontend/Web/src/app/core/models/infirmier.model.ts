export type Sexe = 'M' | 'F';

export interface InfirmierDto {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  role: 'INFIRMIER';
  sexe: Sexe;
  statut: boolean;
  dateNaissance: string;
  telephone: string;
  adresse: string;
  id_utilisateur?: number;
  id_specialite: number;
  id_service: number;
}