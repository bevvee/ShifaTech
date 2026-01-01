package com.shifatech.authservice.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private boolean error;
    private String message;
    private String accessToken;
}
