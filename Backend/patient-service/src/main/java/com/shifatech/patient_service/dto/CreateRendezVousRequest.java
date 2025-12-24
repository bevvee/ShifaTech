package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRendezVousRequest {
    private Long idPatient;
    private Long idDocteur;
    private LocalDateTime dateRdv;
}