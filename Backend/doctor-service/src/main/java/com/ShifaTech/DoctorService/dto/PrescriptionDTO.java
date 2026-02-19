package com.ShifaTech.DoctorService.dto;

import lombok.Data;
import java.util.Date;

@Data
public class PrescriptionDTO {
    private Long idOrdonnance;
    private Long idPatient;
    private Long idDoctor;
    private Date dateCreation;
    private String description;
}
