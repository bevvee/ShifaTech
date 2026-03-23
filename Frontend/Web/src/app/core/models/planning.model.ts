export interface PlanningDto {
  idPlan?: number;
  idDoctor: number;
  jour: string;
  heureDebut: string | null; // "HH:mm:ss"
  heureFin: string | null; // "HH:mm:ss"
  pauseDebut: string | null; // "HH:mm:ss"
  pauseFin: string | null; // "HH:mm:ss"
  createdAt?: string;
  updatedAt?: string;
}
