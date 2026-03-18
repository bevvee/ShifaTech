package com.shifatech.patient_service.dto;

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
    private LocalDateTime dateCreation;
    private String planTraitement;
    private String observations;
    private LocalDateTime dateFermeture;

    // Infos pour l'affichage
    private String nomPatient;
    private String numDossier;
}