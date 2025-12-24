package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousDTO {

    private Long idRendezVous;
    private Long idPatient;
    private Long idDocteur;
    private LocalDateTime dateRendezVous;
    private String statut; // EN_ATTENTE, CONFIRME, ANNULE, TERMINE
    // Infos du docteur
    private String nomDocteur;
    private String prenomDocteur;
    private String specialiteDocteur;
}