export type TypeNotif = 'RAPPEL' | 'RDV' | 'INFO' | 'CONFIRMATION' | 'MODIFICATION';

export interface Notification {
  idNotif: number;
  typeNotif: TypeNotif;
  titre?: string;
  message: string;
  dateEnvoi?: string;  // champ REST
  date?: string;       // champ WebSocket (alias de dateEnvoi)
  idUser?: number;
  idRessource?: number;
  estLu?: boolean;
}