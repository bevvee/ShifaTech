package com.ShifaTech.DoctorService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSpecialityDTO {
    private Long idSpecialite;
    private String label;
    private LocalDateTime createdAt;
}
