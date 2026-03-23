export type Sexe = 'M' | 'F';

export interface InfirmierRow {
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
  idService: number;
  idSpecialite: number;
}
