package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientRequest {
    @Size(max = 100, message = "Le nom de l'assurance ne doit pas dépasser 100 caractères")
    private String assurance;

    @Size(max = 50, message = "Le numéro d'assurance ne doit pas dépasser 50 caractères")
    private String numeroAssurance;

    private Boolean statut;

    // Champs utilisateur à synchroniser
    private String nom;
    private String prenom;
    private String email;
    private String cin;
    private String sexe;
    private String dateNaissance;
    private String telephone;
    private String adresse;
}
