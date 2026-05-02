package com.shifatech.patient_service.dto;

import com.shifatech.patient_service.entity.TypeBlessure;
import com.shifatech.patient_service.entity.TypeVisite;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateVisiteRequest {
    @NotNull(message = "L'ID du docteur est obligatoire")
    private Long idDoctor;

    @NotNull(message = "L'ID du dossier est obligatoire")
    private Long idDossier;

    @NotNull(message = "Le type de visite est obligatoire")
    private TypeVisite typeVisite;

    private TypeBlessure typeBlessure;

    private Long idBodyPart;

    private String planTraitement;

    private String observations;
    private String overlayUrl;
    private String maskUrl;
    private String originalImageUrl;
    private com.shifatech.patient_service.entity.Visite.StatusVisite status;
}
