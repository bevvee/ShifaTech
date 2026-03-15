package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateDossierRequest {
    @DecimalMin(value = "0.5", message = "Le poids doit être supérieur à 0.5 kg")
    @DecimalMax(value = "500.0", message = "Le poids doit être inférieur à 500 kg")
    private BigDecimal poids;

    @DecimalMin(value = "30.0", message = "La taille doit être supérieure à 30 cm")
    @DecimalMax(value = "250.0", message = "La taille doit être inférieure à 250 cm")
    private BigDecimal taille;

    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Format groupe sanguin invalide (ex: A+, O-)")
    private String groupeSanguin;

    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;
    private String notes;
    private String diagnostic;
}
