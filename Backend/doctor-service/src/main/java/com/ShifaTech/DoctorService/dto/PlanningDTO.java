package com.ShifaTech.DoctorService.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class PlanningDTO {
    private Long idPlan;
    private Long idDoctor;
    private String jour;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private LocalTime pauseDebut;
    private LocalTime pauseFin;
}
