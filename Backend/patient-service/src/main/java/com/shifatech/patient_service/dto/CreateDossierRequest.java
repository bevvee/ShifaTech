package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDossierRequest {
    @NotNull(message = "L'ID du patient est obligatoire")
    private Long idPatient;

    private String notes;
    private String diagnostic;
}
