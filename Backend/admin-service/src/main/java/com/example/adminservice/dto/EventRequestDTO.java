package com.example.adminservice.dto;
import lombok.Data;

@Data
public class EventRequestDTO {
    private Integer idRdv;
    private Integer idPatient;
    private Integer idDocteur;
    private String dateRdv;
    private String statut; // "PLANIFIE" ou "ANNULE"
}
