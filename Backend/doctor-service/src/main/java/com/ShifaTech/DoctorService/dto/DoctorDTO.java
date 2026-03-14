package com.ShifaTech.DoctorService.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DoctorDTO {
    private Long idDocteur;
    private Long idUser;
    @NotBlank(message = "numeroOrdre is required")
    private String numeroOrdre;

    // Linked entities info
    private Long idSpecialite;
    private String specialiteLabel;

    private Long idService;

    // Aggregated from Auth-Service
    private String nom;
    private String prenom;
    private String email;
    private String sexe;
    private Boolean statut;
    private String cin;
    private String telephone;
    private String adresse;
    private String dateNaissance;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
