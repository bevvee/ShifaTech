package com.example.adminservice.dto.external;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Enveloppe générique pour les collections API Platform.
 * Supporte "member" (format standard) et "hydra:member" (format JSON-LD).
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiCollectionResponse<T> {

    @JsonAlias({"member", "hydra:member"})
    private List<T> member = new ArrayList<>();
}
