package com.example.adminservice.dto.external;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentDTO {

    private Integer id;

    @JsonProperty("id_patient")
    @JsonAlias("idPatient")
    private Integer idPatient;

    @JsonProperty("id_docteur")
    @JsonAlias("idDocteur")
    private Integer idDocteur;

    @JsonProperty("date_rdv")
    @JsonAlias("dateRdv")
    private OffsetDateTime dateRdv;

    private String statut;

    @JsonProperty("updated_at")
    @JsonAlias("updatedAt")
    private OffsetDateTime updatedAt;

    public boolean hasStatut(String expected) {
        return expected != null && expected.equalsIgnoreCase(statut);
    }
}
