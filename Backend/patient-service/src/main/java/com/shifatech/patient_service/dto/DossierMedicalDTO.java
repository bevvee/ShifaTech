package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.shifatech.patient_service.entity.DossierMedical.StatusDossier;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalDTO {

    private Long idDossier;
    private Long idPatient;
    private StatusDossier status;
    private BigDecimal poids;
    private BigDecimal taille;
    private String groupeSanguin;
    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;
    private String notes;
    private String diagnostic;
    private LocalDateTime dateFermeture;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime dateCreation;

    // Infos du patient pour l'affichage
    private String nomPatient;
    private String numDossier;
    private String sexePatient;

    // Infos du docteur (récupérées du service Auth)
    private String nomDocteur;
    private String prenomDocteur;
}