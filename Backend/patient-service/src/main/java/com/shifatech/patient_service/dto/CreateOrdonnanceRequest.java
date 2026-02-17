package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateOrdonnanceRequest {
    @NotNull(message = "L'ID du patient est obligatoire")
    private Long idPatient;

    @NotNull(message = "L'ID du médecin est obligatoire")
    private Long idDoctor;

    private Long idVisite;

    @NotNull(message = "La liste des médicaments est obligatoire")
    private String medicaments;

    private String description;
    private String posologie;
    private String dureeTraitement;
    private String instructions;
    private LocalDateTime dateValidite;
}
