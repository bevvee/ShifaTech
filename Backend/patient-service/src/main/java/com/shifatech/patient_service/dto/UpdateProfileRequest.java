package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @DecimalMin(value = "0.0", message = "Le poids doit être positif")
    @DecimalMax(value = "500.0", message = "Le poids doit être réaliste")
    private BigDecimal poids;

    @DecimalMin(value = "0.0", message = "La taille doit être positive")
    @DecimalMax(value = "300.0", message = "La taille doit être réaliste")
    private BigDecimal taille;

    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Format groupe sanguin invalide")
    private String groupeSanguin;

    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;
    private String assurance;
    private String numeroAssurance;
    private String contactUrgenceNom;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Format de téléphone invalide")
    private String contactUrgenceTel;
}