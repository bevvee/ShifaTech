package com.ShifaTech.DoctorService.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ConsultationDTO {
    private Long idDossier;
    private Long idPatient;
    private String status; // StatusDossier as String
    private Double poids;
    private Double taille;
    private String groupeSanguin;
    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;
    private String notes;
    private String diagnostic;
    private Long idOrdonnance;
    private Date dateCreation;
    private Date dateFermeture;
    private String nomDocteur;
    private String prenomDocteur;
}

