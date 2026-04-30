export type Sexe = 'M' | 'F';
export type AssuranceType = 'CNSS' | 'CNOPS' | 'RAMED' | 'FAR' | 'Privée' | 'Aucune';

// Champs de l'entité Patient (backend Spring Boot)
export interface PatientDto {
  id: number;
  idUser: number;
  numDossier: string;
  assurance: AssuranceType;
  numeroAssurance: string;
  statut: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Champs User (pour affichage dans la liste — viennent du service Auth en production)
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  sexe: Sexe;
  dateNaissance: string;
  telephone: string;
  adresse: string;
  userInfo?: {
    idUser: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
    sexe: Sexe;
    dateNaissance: string;
  };
}

// DTO de création patient (formulaire complet)
export interface PatientCreateDto {
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  sexe: Sexe;
  dateNaissance: string;
  telephone: string;
  adresse: string;
  assurance: AssuranceType;
  numeroAssurance: string;
  statut: boolean;
}