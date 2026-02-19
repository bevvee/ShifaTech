package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.NotNull;
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
public class CreateDossierRequest {

    @NotNull(message = "L'ID du patient est obligatoire")
    private Long idPatient;

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
