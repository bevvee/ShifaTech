package com.example.adminservice.dto.external;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class InfirmierDTO {

    @JsonProperty("id_specialite")
    @JsonAlias("idSpecialite")
    private Object rawIdSpecialite;

    @JsonProperty("id_utilisateur")
    @JsonAlias("idUtilisateur")
    private Integer idUtilisateur;

    public Integer getIdSpecialite() {
        if (rawIdSpecialite == null) return null;
        if (rawIdSpecialite instanceof Integer) return (Integer) rawIdSpecialite;
        if (rawIdSpecialite instanceof String) {
            String s = (String) rawIdSpecialite;
            String[] parts = s.split("/");
            try {
                return Integer.parseInt(parts[parts.length - 1]);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        if (rawIdSpecialite instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) rawIdSpecialite;
            if (map.containsKey("id_specialite")) return (Integer) map.get("id_specialite");
            if (map.containsKey("id")) return (Integer) map.get("id");
        }
        return null;
    }
}
