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
    private UserDTO userInfo;
}
