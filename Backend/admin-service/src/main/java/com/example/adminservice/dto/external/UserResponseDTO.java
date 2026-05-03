package com.example.adminservice.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserResponseDTO {

    private Integer id;
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
