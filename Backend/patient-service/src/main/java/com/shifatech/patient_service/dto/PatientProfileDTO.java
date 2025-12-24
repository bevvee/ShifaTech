package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileDTO {

    // Données du service Auth
    private Long idUser;
    private String nom;
    private String prenom;
    private String email;
    private LocalDate dateNaissance;
    private String telephone;
    private String adresse;
    private String genre;

    // Données médicales
    private Long idPatient;
    private String numDossier;
    private Double poids;
    private Double taille;
}