package com.shifatech.patient_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Utilitaire pour extraire les informations du JWT token
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret:shifatech-secret-key-for-jwt-token-generation-and-validation-minimum-256-bits}")
    private String jwtSecret;

    /**
     * Extraire l'ID utilisateur du token JWT depuis le contexte de sécurité
     */
    public Long getUserIdFromToken() {
        try {
            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            return userId != null ? Long.parseLong(userId) : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Valider et extraire les claims d'un token JWT
     */
    public Claims extractClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

