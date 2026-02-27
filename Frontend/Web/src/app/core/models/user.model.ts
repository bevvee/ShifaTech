import { Role } from './role.enum';
import { Sexe } from './sexe.enum';

export interface UserDto {
  idUser: number;
  nom : string;
     prenom : string;
     cin : string;
     email : string;
     sexe : Sexe[];
     statut : boolean;
     dateNaissance : string;
     telephone : string;
     adresse : string;
    roles: Role[];
}
