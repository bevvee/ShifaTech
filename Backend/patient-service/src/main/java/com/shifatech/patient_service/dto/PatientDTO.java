package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {

    private Long idPatient;
    private Long idUser;
    private String numDossier;
    private Double poids;
    private Double taille;
}