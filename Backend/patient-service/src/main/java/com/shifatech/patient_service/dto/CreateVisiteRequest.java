package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateVisiteRequest {
    @NotNull(message = "L'ID du docteur est obligatoire")
    private Long idDoctor;

    @NotNull(message = "L'ID du dossier est obligatoire")
    private Long idDossier;

    @NotNull(message = "Le plan de traitement est obligatoire")
    private String planTraitement;

    private String observations;
}
