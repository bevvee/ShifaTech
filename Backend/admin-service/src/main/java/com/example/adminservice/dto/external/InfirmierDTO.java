package com.example.adminservice.dto.external;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class InfirmierDTO {

    @JsonProperty("id_specialite")
    @JsonAlias("idSpecialite")
    private Integer idSpecialite;

    @JsonProperty("id_utilisateur")
    @JsonAlias("idUtilisateur")
    private Integer idUtilisateur;
}
