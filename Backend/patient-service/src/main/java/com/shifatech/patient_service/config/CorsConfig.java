package com.shifatech.patient_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Permettre toutes les origines en développement
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");

        // Permettre tous les headers
        config.setAllowedHeaders(Arrays.asList("*"));

        // Permettre toutes les méthodes HTTP
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Exposer les headers nécessaires
        config.setExposedHeaders(Arrays.asList("Authorization", "X-User-Id"));

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}