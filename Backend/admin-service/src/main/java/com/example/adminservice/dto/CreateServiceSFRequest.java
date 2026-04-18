package com.example.adminservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateServiceSFRequest {
    @NotBlank
    private String label;

    private String description;
}
