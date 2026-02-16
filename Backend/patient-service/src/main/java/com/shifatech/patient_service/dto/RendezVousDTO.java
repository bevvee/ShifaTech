package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousDTO {
    private Long idRdv;
    private Long idPatient;
    private Long idDoctor;
    private LocalDate dateRdv;
    private LocalTime heureRdv;
    private String statut; // EN_ATTENTE, CONFIRME, ANNULE, TERMINE
    private LocalDateTime createdAt;

    // Informations supplémentaires (optionnelles)
    private String nomPatient;
    private String nomDoctor;
    private String motif;
}