package com.shifatech.authservice.controller;

import com.shifatech.authservice.dto.*;
import com.shifatech.authservice.entity.PasswordResetToken;
import com.shifatech.authservice.entity.User;
import com.shifatech.authservice.repository.PasswordResetTokenRepository;
import com.shifatech.authservice.repository.UserRepository;
import com.shifatech.authservice.service.AuthService;
import com.shifatech.authservice.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

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
    // forgot-password
    @GetMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestParam String email) {

        userRepository.findByEmail(email).ifPresent(user -> {

            // 🔥 delete old token if exists
            passwordResetTokenRepository.findByUser(user)
                    .ifPresent(passwordResetTokenRepository::delete);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setUser(user);
            resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));

            passwordResetTokenRepository.save(resetToken);

            emailService.sendResetPasswordEmail(
                    user.getEmail(),
                    resetToken.getToken()
            );
        });

        return ResponseEntity.ok(
                new ApiResponse(false, "If your email exists, a password reset link has been sent")
        );
    }

    // reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword,
            @RequestParam String confirmPassword) {

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(true, "Password and confirmation do not match"));
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Invalid or expired token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(true, "Token has expired"));
        }

        User user = resetToken.getUser();

        user.setMotDePasse(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 🔥 VERY IMPORTANT — token must be deleted
        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok(
                new ApiResponse(false, "Password reset successfully"));
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Auth Service is running");
    }
}
