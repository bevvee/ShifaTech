package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileDTO {
    private Long idPatient;
    private Long idUser;
    private String numDossier;
    private BigDecimal poids;
    private BigDecimal taille;
    private String groupeSanguin;
    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;
    private String assurance;
    private String numeroAssurance;
    private String contactUrgenceNom;
    private String contactUrgenceTel;

    // Informations utilisateur (du service Auth)
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
}