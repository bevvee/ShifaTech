package com.example.adminservice.dto;

import lombok.Data;

@Data
public class EventRequestDTO {

    private Integer idRdv;
    private Integer idPatient;
    private Integer idDocteur;

    /** Null si le RDV a été créé par le patient lui-même. */
    private Integer idInfirmier;

    private String dateRdv;
    private String statut;
}
