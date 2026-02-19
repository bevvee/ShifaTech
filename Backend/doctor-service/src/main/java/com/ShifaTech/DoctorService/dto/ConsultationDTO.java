package com.ShifaTech.DoctorService.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ConsultationDTO {
    private Long idDossier;
    private Long idPatient;
    private Long idDocteur;
    private Date dateCreation;
    private Date dateFermeture;
    private String notes;
    private String diagnostic;
    private Long idOrdonnance;
}
