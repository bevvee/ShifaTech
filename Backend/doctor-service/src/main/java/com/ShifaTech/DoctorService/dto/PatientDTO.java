
 package com.ShifaTech.DoctorService.dto;

 import lombok.Data;
 
  @Data
  public class PatientDTO {
    private Long idPatient;
    private Long idUser;
    private String numDossier;
    private String assurance;
    private String numeroAssurance;
    private Boolean statut;

    // Informations personnelles (aplaties venant du patient-service)
    private String nom;
    private String prenom;
    private String cin;
    private String email;
    private String sexe;
    private String dateNaissance;
    private String telephone;
    private String adresse;

    private UserDTO userInfo;
  }
 
