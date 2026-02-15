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
    private LocalDateTime dateCreation;
    private String description;
    private String medicaments;
    private String posologie;
    private String dureeTraitement;
    private String instructions;
    private LocalDateTime dateValidite;
    private Boolean statut;
}