package com.shifatech.patient_service.dto;

import lombok.Data;

@Data
public class UpdateDossierRequest {
    private String notes;
    private String diagnostic;
}
