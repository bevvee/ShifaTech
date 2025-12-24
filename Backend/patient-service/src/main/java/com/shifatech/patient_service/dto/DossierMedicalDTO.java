package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalDTO {

    private Long idDossier;
    private Long idPatient;
    private Long idDocteur;
    private LocalDateTime dateCreation;
    private LocalDateTime dateFermeture;
    private String notes;
    private String diagnostic;
    private Long idOrdonnance;
    // Infos du docteur (récupérées du service Auth)
    private String nomDocteur;
    private String prenomDocteur;
}