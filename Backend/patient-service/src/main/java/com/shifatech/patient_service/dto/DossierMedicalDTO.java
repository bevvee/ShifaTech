package com.shifatech.patient_service.dto;

import com.shifatech.patient_service.entity.DossierMedical.StatusDossier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalDTO {
    private Long idDossier;
    private Long idPatient;
    private StatusDossier status;
    private BigDecimal poids;
    private BigDecimal taille;
    private String groupeSanguin;
    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;
    private String notes;
    private String diagnostic;
    private LocalDateTime dateFermeture;
    private LocalDateTime dateCreation;
}