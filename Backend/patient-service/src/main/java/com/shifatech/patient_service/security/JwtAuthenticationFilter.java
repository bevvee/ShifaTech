package com.shifatech.patient_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret:shifatech-secret-key-for-jwt-token-generation-and-validation-minimum-256-bits}")
    private String jwtSecret;

    @Value("${security.jwt.enabled:false}")
    private boolean jwtEnabled;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Si JWT est désactivé, passer directement sans vérification
        if (!jwtEnabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("JWT token manquant ou invalide dans l'en-tête Authorization");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            Claims claims = validateToken(token);

            // Extraire les informations du token
            String userId = claims.getSubject();
            String role = claims.get("role", String.class);

            // Créer l'authentification
            List<SimpleGrantedAuthority> authorities = role != null 
                ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                : Collections.emptyList();

            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userId, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("JWT token validé pour l'utilisateur: {}", userId);

        } catch (Exception e) {
            log.error("Erreur lors de la validation du JWT token: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Claims validateToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

