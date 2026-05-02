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
public class OrdonnanceDTO {
    private Long idOrdonnance;
    private Long idPatient;
    private Long idDoctor;
    private Long idVisite;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime dateCreation;
    private String description;
    private String medicaments;
    private String posologie;
    private String dureeTraitement;
    private String instructions;
    private java.time.LocalDate dateValidite;
    private com.shifatech.patient_service.entity.StatusOrdonnance statut;

    // Infos pour l'affichage
    private String nomPatient;
    private String numDossier;
    private String sexePatient;
}