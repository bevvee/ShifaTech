package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateDossierRequest {
    private BigDecimal poids;
    private BigDecimal taille;

    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Format groupe sanguin invalide (ex: A+, O-)")
    private String groupeSanguin;

    private String antecedentsMedicaux;
    private String allergies;
    private String pathologiesChroniques;
    private String notes;
    private String diagnostic;
}
