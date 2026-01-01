package com.shifatech.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ApiResponse {
    private boolean error;
    private String message;

    public ApiResponse(boolean error, String message) {
        this.error = error;
        this.message = message;
    }

    // Getters and setters
    public boolean isError() { return error; }
    public void setError(boolean error) { this.error = error; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
