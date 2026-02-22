export interface RdvCreateDto {
  date_rdv: string;  
  heure_rdv: string;     
  id_patient: number;
  id_docteur: number;
  status?: string;       
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
