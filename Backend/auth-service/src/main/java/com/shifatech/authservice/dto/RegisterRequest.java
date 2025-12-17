package com.shifatech.authservice.dto;

import com.shifatech.authservice.Enum.RoleEnum;
import com.shifatech.authservice.Enum.SexeEnum;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    private String nom;
    private String prenom;
    private String cin;
    private String email;
    private String password;
    private RoleEnum role;
    private SexeEnum sexe;
    private LocalDate dateNaissance;
    private String telephone;
    private String adresse;
}

