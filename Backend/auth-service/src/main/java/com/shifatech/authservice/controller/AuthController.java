package com.shifatech.authservice.controller;

import com.shifatech.authservice.dto.*;
import com.shifatech.authservice.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody @Valid RegisterRequest request) {
        ApiResponse response = authService.register(request);
        HttpStatus status = response.isError() ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
        return new ResponseEntity<>(response, status);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        HttpStatus status = response.isError() ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
        return new ResponseEntity<>(response, status);
    }

    // Profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Object result = authService.getProfile();
        if (result instanceof ApiResponse api) {
            HttpStatus status = api.getMessage().equals("User not authenticated") ?
                    HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST;
            return new ResponseEntity<>(api, status);
        }
        return ResponseEntity.ok(result);
    }
    // Logout
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(new ApiResponse(false, "Logged out successfully"));
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Auth Service is running");
    }
}
