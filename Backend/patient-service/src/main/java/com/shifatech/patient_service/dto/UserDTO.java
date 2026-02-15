package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long idUser;
    private String nom;
    private String prenom;
    private String cin;
    private String email;
    private String role;
    private String sexe;
    private Boolean statut;
    private LocalDate dateNaissance;
    private String telephone;
    private String adresse;
    private LocalDateTime createdAt;
}