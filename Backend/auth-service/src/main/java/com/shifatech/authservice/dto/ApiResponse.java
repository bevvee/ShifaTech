package com.shifatech.authservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ApiResponse {
    private boolean error;
    private String message;
    private UserDto user;

    public ApiResponse(boolean error, String message) {
        this.error = error;
        this.message = message;
    }

    public ApiResponse(boolean error, String message, UserDto user) {
        this.error = error;
        this.message = message;
        this.user = user;
    }
}
