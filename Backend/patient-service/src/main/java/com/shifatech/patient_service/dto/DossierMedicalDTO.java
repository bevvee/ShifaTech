package com.shifatech.patient_service.dto;

import com.shifatech.patient_service.entity.DossierMedical.StatusDossier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalDTO {
    private Long idDossier;
    private Long idPatient;
    private StatusDossier status;
    private String notes;
    private String diagnostic;
    private LocalDateTime dateFermeture;
    private LocalDateTime dateCreation;
}