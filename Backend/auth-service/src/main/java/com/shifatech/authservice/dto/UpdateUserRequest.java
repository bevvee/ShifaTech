package com.shifatech.authservice.dto;

import java.time.LocalDate;

import com.shifatech.authservice.Enum.RoleEnum;
import com.shifatech.authservice.Enum.SexeEnum;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateUserRequest {

    @Size(min = 2, max = 50, message = "Nom doit contenir entre 2 et 50 caractères")
    private String nom;

    @Size(min = 2, max = 50, message = "Prenom doit contenir entre 2 et 50 caractères")
    private String prenom;

    @Size(min = 6, max = 15, message = "CIN doit contenir entre 6 et 15 caractères")
    private String cin;

    @Email(message = "Format d'email invalide")
    private String email;

    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}$",
            message = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
    )
    private String motDePasse;

    @Pattern(
            regexp = "^[0-9]{10,15}$",
            message = "Le téléphone doit contenir uniquement des chiffres (10 à 15 caractères)"
    )
    private String telephone;

    @Size(min = 5, max = 255, message = "Adresse invalide")
    private String adresse;

    private RoleEnum role;

    private SexeEnum sexe;

    private Boolean statut;

    private LocalDate dateNaissance;
}