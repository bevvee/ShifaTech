package com.ShifaTech.DoctorService.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long idUser;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private String sexe;
    private String dateNaissance;
    private String role;
}
