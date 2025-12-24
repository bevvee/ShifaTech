package com.shifatech.patient_service.config;

import com.shifatech.patient_service.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${security.jwt.enabled:false}")
    private boolean jwtEnabled;

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // Autoriser l'accès aux ressources statiques sans authentification
        return (web) -> web.ignoring()
                .requestMatchers("/", "/index.html", "/static/**", "/css/**", "/js/**", "/images/**", "/favicon.ico");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Désactiver complètement la sécurité pour tous les endpoints en mode développement
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        // Ajouter le filtre JWT seulement si activé
        if (jwtEnabled) {
            http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }
}

