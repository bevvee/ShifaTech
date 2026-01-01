package com.shifatech.authservice.dto;

import com.shifatech.authservice.Enum.RoleEnum;
import com.shifatech.authservice.Enum.SexeEnum;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.UniqueElements;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    @NotBlank(message = "Nom is required")
    private String nom;

    @NotBlank(message = "Prenom is required")
    private String prenom;

    @NotBlank(message = "CIN is required")
    @Size(min = 6, max = 15, message = "CIN must be between 6 and 15 characters")
    private String cin;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}$",
            message = "Password must be at least 8 characters long, include one uppercase, one lowercase letter and one digit"
    )
    private String password;

    @NotBlank(message = "Password confirmation is required")
    private String passwordConfirmation;

    @NotNull(message = "Role is required")
    private RoleEnum role;

    @NotNull(message = "Sexe is required")
    private SexeEnum sexe;

    @NotNull(message = "Date de naissance is required")
    private LocalDate dateNaissance;

    @NotBlank(message = "Telephone is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Telephone must contain only digits (10-15 characters)")
    private String telephone;

    @NotBlank(message = "Adresse is required")
    private String adresse;
}
