package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String nom;
    private String prenom;
    private String cin;
    private String email;
    private String password;
    private String passwordConfirmation;
    private String role; // "PATIENT", "DOCTEUR", etc.
    private String sexe; // "M" or "F"
    private String dateNaissance;
    private String telephone;
    private String adresse;
}
