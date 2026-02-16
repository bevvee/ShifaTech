package com.shifatech.authservice.service;

import com.shifatech.authservice.dto.*;
import com.shifatech.authservice.entity.*;
import com.shifatech.authservice.repository.*;
import com.shifatech.authservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RevokedTokenRepository revokedTokenRepository;

    // Register with friendly messages
    public ApiResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getPasswordConfirmation())) {
            return new ApiResponse(true, "Password and password confirmation do not match");
        }

        try {
            User user = new User();
            user.setNom(request.getNom());
            user.setPrenom(request.getPrenom());
            user.setCin(request.getCin());
            user.setEmail(request.getEmail());
            user.setMotDePasse(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole());
            user.setSexe(request.getSexe());
            user.setDateNaissance(request.getDateNaissance());
            user.setTelephone(request.getTelephone());
            user.setAdresse(request.getAdresse());
            user.setStatut(false);

            userRepository.save(user);
            return new ApiResponse(false, "User registered successfully", new UserDto().toUserDto(user));

        } catch (DataIntegrityViolationException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof ConstraintViolationException cve) {
                SQLException sqlEx = cve.getSQLException();
                if (sqlEx.getErrorCode() == 1062) {
                    String msg = sqlEx.getMessage();
                    if (msg.contains(request.getEmail())) return new ApiResponse(true, "Email is already used");
                    if (msg.contains(request.getCin())) return new ApiResponse(true, "CIN is already used");
                    if (msg.contains(request.getTelephone())) return new ApiResponse(true, "Telephone is already used");
                    return new ApiResponse(true, "Duplicate value found");
                }
            }
            return new ApiResponse(true, "Data integrity violation");
        } catch (Exception ex) {
            return new ApiResponse(true, "Something went wrong");
        }
    }

    // Login with friendly messages
    public LoginResponse login(LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);

            if (user == null || !passwordEncoder.matches(request.getPassword(), user.getMotDePasse())) {
                return new LoginResponse(true, "Invalid email or password", null);
            }

            String token = jwtUtil.generateToken(user);
            return new LoginResponse(false, "Login successful", token);

        } catch (Exception ex) {
            return new LoginResponse(true, "Something went wrong", null);
        }
    }

    // Get user profile
    public ApiResponse getProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return new ApiResponse(true, "User not authenticated");
            }

            Long userId = Long.parseLong(auth.getName());
            User user = userRepository.findById(Math.toIntExact(userId)).orElse(null);

            if (user == null) {
                return new ApiResponse(true, "User not found");
            }

            return new ApiResponse(false, "User found successfuly",new UserDto().toUserDto(user));

        } catch (Exception ex) {
            return new ApiResponse(true, "Something went wrong");
        }
    }
    // Logout user
    public ApiResponse logout(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                revokedTokenRepository.save(RevokedToken.builder()
                        .token(token)
                        .revokedAt(Instant.now())
                        .build());
            }
            return new ApiResponse(false, "Logged out successfully");
        } catch (Exception ex) {
            return new ApiResponse(true, "Something went wrong during logout");
        }
    }

}