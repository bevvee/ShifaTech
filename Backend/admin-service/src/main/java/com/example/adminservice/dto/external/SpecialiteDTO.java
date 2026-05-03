package com.example.adminservice.dto.external;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SpecialiteDTO {

    @JsonProperty("id")
    @JsonAlias("id_specialite")
    private Integer id;

    @JsonProperty("id_service")
    @JsonAlias("idService")
    private Integer idService;
}
