package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AfficheDTO {

    private Long idAffiche;
    private Long idPatient;
    private Long idDocteur;
    private LocalDateTime dateCreation;
    private String titre;
    // Infos du docteur
    private String nomDocteur;
    private String prenomDocteur;
}