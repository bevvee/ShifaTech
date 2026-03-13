package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousDTO {
    private Integer id;
    private Integer idPatient;
    private Integer idDocteur;
    private Integer idSpecialite;
    private LocalDate dateRdv;
    private LocalTime heurRdv;
    private Boolean statut;
}