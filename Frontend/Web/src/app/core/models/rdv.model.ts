export interface RdvCreateDto {

  id?: number;

  date_rdv: string;

  heure_debut: string;

  heure_fin: string;

  id_patient: number;

  id_docteur: number;

  statut?: string;

}

export interface RdvDto extends RdvCreateDto {
  id_rdv: number;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
  deleted_by?: number;
}
