package com.ShifaTech.DoctorService.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey SECRET_KEY;
    private final long accessMillis;

    // Inject secret key and token expiration duration from properties
    public JwtUtil(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.accessMillis}") long accessMillis
    ) {
        this.SECRET_KEY = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.accessMillis = accessMillis;
    }

    // Generate JWT for a user
    public String generateToken(Long userId, String email, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claim("userId", userId)
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + accessMillis))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract claims from a JWT
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Validate a JWT
    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("JWT expired: " + e.getMessage());
            return false;
        } catch (JwtException e) {
            System.out.println("JWT validation failed: " + e.getMessage());
            return false;
        }
    }
}