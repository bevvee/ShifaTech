package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class CreateOrdonnanceRequest {
    @NotNull(message = "L'ID du patient est obligatoire")
    private Long idPatient;

    @NotNull(message = "L'ID du médecin est obligatoire")
    private Long idDoctor;

    private Long idVisite;

    @NotBlank(message = "La liste des médicaments est obligatoire")
    private String medicaments;

    private String description;
    private String posologie;
    private String dureeTraitement;
    private String instructions;

    @NotNull(message = "La date de validité est obligatoire")
    @FutureOrPresent(message = "La date de validité doit être aujourd'hui ou dans le futur")
    private java.time.LocalDate dateValidite;
}
