package com.ShifaTech.DoctorService.dto;

import lombok.Data;

@Data
public class PatientDTO {
    private Long idPatient;
    private Long idUser;
    private String numDossier;
    private Double poids;
    private Double taille;
    // User info potentially embedded if Patient Service returns it
    private String nom;
    private String prenom;
}
