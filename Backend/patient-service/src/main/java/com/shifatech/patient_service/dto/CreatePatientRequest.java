package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientRequest {
    // Si idUser est présent, on lie le patient à un compte existant
    private Long idUser;

    @Size(max = 100, message = "Le nom de l'assurance ne doit pas dépasser 100 caractères")
    private String assurance;

    @Size(max = 50, message = "Le numéro d'assurance ne doit pas dépasser 50 caractères")
    private String numeroAssurance;

    // Informations pour création du compte Auth si idUser est null
    private String nom;
    private String prenom;
    private String cin;
    private String email;
    private String sexe;
    private String dateNaissance;
    private String telephone;
    private String adresse;
}
