package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalDTO {

    private Long idDossier;
    private Long idPatient;<<<<<<<HEAD
    private Long idDocteur;
    private LocalDateTime dateCreation;
    private LocalDateTime dateFermeture;=======
    private StatusDossier status;
    private BigDecimal poids;
    private BigDecimal taille;
    private String groupeSanguin;
    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;>>>>>>>

    ddc2623 (feat: restructure patient medical data and clean up entity fields)

    private String notes;
    private String diagnostic;
    private Long idOrdonnance;
    // Infos du docteur (récupérées du service Auth)
    private String nomDocteur;
    private String prenomDocteur;
}