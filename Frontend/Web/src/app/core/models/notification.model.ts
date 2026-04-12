export interface Notification {
  idNotif: number;
  typeNotif: 'RAPPEL' | 'RDV' | 'FACTURE' | 'INFO';
  message: string;
  dateEnvoi: string;
  idUser: number;
  emailDestinataire?: string;
  estLu?: boolean;
}