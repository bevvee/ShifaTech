package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Long idPatient;
    private Long idUser;
    private String numDossier;
    private BigDecimal poids;
    private BigDecimal taille;
    private String groupeSanguin;
    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;
    private String assurance;
    private String numeroAssurance;
    private String contactUrgenceNom;
    private String contactUrgenceTel;
    private Boolean statut;
    private LocalDateTime createdAt;

    // Informations de l'utilisateur (provenant du service Auth)
    private UserDTO userInfo;
}