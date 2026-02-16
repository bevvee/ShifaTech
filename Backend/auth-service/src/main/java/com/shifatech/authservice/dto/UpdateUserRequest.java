package com.shifatech.authservice.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserRequest {
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private String telephone;
    private String adresse;
    private String role;
    private String sexe;
    private LocalDate dateNaissance;
}
