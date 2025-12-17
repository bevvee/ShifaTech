package com.shifatech.authservice.service;

import com.shifatech.authservice.dto.*;
import com.shifatech.authservice.entity.*;
import com.shifatech.authservice.repository.*;
import com.shifatech.authservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RevokedTokenRepository revokedTokenRepository;


    public void register(RegisterRequest request) {

        User user = new User();

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setCin(request.getCin());
        user.setEmail(request.getEmail());

        user.setMotDePasse(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(request.getRole());
        user.setSexe(request.getSexe());
        user.setDateNaissance(request.getDateNaissance());
        user.setTelephone(request.getTelephone());
        user.setAdresse(request.getAdresse());

        user.setStatut(false); // default

        userRepository.save(user);
    }


    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getMotDePasse())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user);

        UserDto userDto = mapToDto(user);
        return new LoginResponse(token, userDto);
    }

    public UserProfileResponse getProfile(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7); // remove "Bearer "
        Long userId = Long.parseLong(jwtUtil.extractClaims(token).getSubject());

        User user = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserProfileResponse(
                user.getIdUser(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole().name()
        );
    }
    public void logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            revokedTokenRepository.save(
                    RevokedToken.builder()
                            .token(token)
                            .revokedAt(Instant.now())
                            .build()
            );
        }
    }

    public boolean isTokenValid(String token) {
        return !revokedTokenRepository.existsByToken(token);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setIdUser(user.getIdUser());
        dto.setFullName(user.getPrenom() + " " + user.getNom());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }
}