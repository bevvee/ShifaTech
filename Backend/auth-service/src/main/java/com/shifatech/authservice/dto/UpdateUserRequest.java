package com.shifatech.authservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class UpdateUserRequest {
    @NotBlank(message = "Nom is required")
    private String nom;

    @NotBlank(message = "Prenom is required")
    private String prenom;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "CIN is required")
    @Size(min = 6, max = 15, message = "CIN must be between 6 and 15 characters")
    private String cin;

    private String motDePasse;
    private String motDePasseConfirmation;

    @NotBlank(message = "Telephone is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Telephone must contain only digits (10-15 characters)")
    private String telephone;

    private String adresse;
    private String role;
    private String sexe;
    private LocalDate dateNaissance;
    private Boolean statut;
}
