package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientRequest {

    @NotNull(message = "L'ID utilisateur est obligatoire")
    private Long idUser;

    @Size(max = 100, message = "Le nom de l'assurance ne doit pas dépasser 100 caractères")
    private String assurance;

    @Size(max = 50, message = "Le numéro d'assurance ne doit pas dépasser 50 caractères")
    private String numeroAssurance;
}