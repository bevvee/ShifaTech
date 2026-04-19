package com.example.adminservice.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Supporte deux formats de réponse de l'auth-service :
 *   { "email": "x@y.com" }
 *   { "user": { "email": "x@y.com" } }
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserResponseDTO {

    private String email;
    private UserDetailDTO user;

    public String resolveEmail() {
        if (user != null && user.getEmail() != null) return user.getEmail();
        return email;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UserDetailDTO {
        private String email;
    }
}
