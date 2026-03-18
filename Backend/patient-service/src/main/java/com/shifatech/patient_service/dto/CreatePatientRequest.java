package com.shifatech.patient_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientRequest {
    // Si idUser est présent, on lie le patient à un compte existant
    private Long idUser;

    @Size(max = 100, message = "Le nom de l'assurance ne doit pas dépasser 100 caractères")
    private String assurance;

    @Size(max = 50, message = "Le numéro d'assurance ne doit pas dépasser 50 caractères")
    private String numeroAssurance;

    // Informations pour création du compte Auth si idUser est null
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le CIN est obligatoire")
    private String cin;

    @Email(message = "L'adresse email n'est pas valide")
    private String email;

    @NotBlank(message = "Le sexe est obligatoire")
    @Pattern(regexp = "^[MF]$", message = "Le sexe doit être 'M' ou 'F'")
    private String sexe;

    @NotBlank(message = "La date de naissance est obligatoire")
    private String dateNaissance;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9\\-\\s]{8,20}$", message = "Format du numéro de téléphone invalide")
    private String telephone;

    private String adresse;
}
