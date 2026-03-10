package com.ShifaTech.DoctorService.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DoctorDTO {
    private Long idDocteur;
    private Long idUser;
    @NotBlank(message = "numeroOrdre is required")
    private String numeroOrdre;

    // Aggregated Info from auth Service (Removed for independence)

    // Linked entities info
    private Long idSpecialite;
    private String specialiteLabel;

    private Long idService;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
