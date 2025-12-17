package com.shifatech.authservice.dto;

public record UserProfileResponse(
        Integer id,
        String nom,
        String prenom,
        String email,
        String role
) {}
