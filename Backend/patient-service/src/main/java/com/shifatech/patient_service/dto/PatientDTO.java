package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Long idPatient;
    private Long idUser;
    private String numDossier;
    private String assurance;
    private String numeroAssurance;
    private Boolean statut;
    private LocalDateTime createdAt;

    // Informations de l'utilisateur (provenant du service Auth)
    private UserDTO userInfo;
}