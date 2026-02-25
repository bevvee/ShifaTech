package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRendezVousRequest {
    @NotNull(message = "L'ID du patient est obligatoire")
    private Integer idPatient;
    
    private Integer idDocteur;
    
    @NotNull(message = "L'ID de la spécialité est obligatoire")
    private Integer idSpecialite;
    
    @NotNull(message = "La date du rendez-vous est obligatoire")
    private LocalDate dateRdv;
    
    @NotNull(message = "L'heure du rendez-vous est obligatoire")
    private LocalTime heurRdv;
}
