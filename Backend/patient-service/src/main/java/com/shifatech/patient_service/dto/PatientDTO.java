package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {

    private Long idPatient;
    private Long idUser;
    private String numDossier;
    private String assurance;
    private String numeroAssurance;
    private Boolean statut;
    private LocalDateTime createdAt;

    // Informations personnelles (aplaties pour le frontend)
    private String nom;
    private String prenom;
    private String cin;
    private String email;
    private String sexe;
    private String dateNaissance;
    private String telephone;
    private String adresse;

}