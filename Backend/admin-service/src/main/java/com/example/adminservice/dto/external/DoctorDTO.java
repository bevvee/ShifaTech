package com.example.adminservice.dto.external;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoctorDTO {

    @JsonProperty("idUser")
    @JsonAlias("id_user")
    private Integer idUser;

    @JsonProperty("idService")
    @JsonAlias("id_service")
    private Integer idService;
}
