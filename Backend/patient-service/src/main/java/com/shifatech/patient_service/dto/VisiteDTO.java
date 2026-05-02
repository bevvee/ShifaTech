package com.shifatech.patient_service.dto;

import com.shifatech.patient_service.entity.TypeBlessure;
import com.shifatech.patient_service.entity.TypeVisite;
import com.shifatech.patient_service.entity.Visite.StatusVisite;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisiteDTO {
    private Long idVisite;
    private Long idDoctor;
    private Long idDossier;
    private StatusVisite status;
    private TypeVisite typeVisite;
    private TypeBlessure typeBlessure;
    private Long idBodyPart;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime dateCreation;
    private String planTraitement;
    private String observations;
    private String overlayUrl;
    private String maskUrl;
    private String originalImageUrl;
    private LocalDateTime dateFermeture;

    // Infos pour l'affichage
    private String nomPatient;
    private String numDossier;
}