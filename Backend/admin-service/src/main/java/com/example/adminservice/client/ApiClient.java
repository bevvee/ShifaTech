package com.example.adminservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiClient {

    private final RestTemplate restTemplate;

    @Value("${auth.service.email}")
    private String authEmail;

    @Value("${auth.service.password}")
    private String authPassword;

    public String fetchJwtToken() {
        try {
            Map<String, String> creds = new HashMap<>();
            creds.put("email", authEmail);
            creds.put("password", authPassword);
            ResponseEntity<Map> res = restTemplate.postForEntity("http://auth-service:8080/login", creds, Map.class);
            return res.getBody() != null ? (String) res.getBody().get("accessToken") : null;
        } catch (Exception e) {
            log.error("Erreur de connexion Auth: {}", e.getMessage());
            return null;
        }
    }

    public Integer getUserIdForDoctor(Integer idDocteur, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            ResponseEntity<Map> res = restTemplate.exchange(
                    "http://doctor-service:8080/" + idDocteur,
                    HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            if (res.getBody() != null && res.getBody().get("idUser") != null) {
                return Integer.parseInt(res.getBody().get("idUser").toString());
            }
        } catch (Exception e) {
            log.warn("Impossible de résoudre idDocteur={} à cause de l'erreur : {}", idDocteur, e.getMessage());
        }
        return null;
    }

    public List<Map<String, Object>> fetchAllAppointments(String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            ResponseEntity<Map> res = restTemplate.exchange(
                    "http://rdv-service:9000/api/rendez_vouses",
                    HttpMethod.GET, new HttpEntity<>(headers),
                    new ParameterizedTypeReference<Map>() {
                    });
            if (res.getBody() == null)
                return null;
            Object member = res.getBody().get("member");
            return member instanceof List ? (List<Map<String, Object>>) member : null;
        } catch (Exception e) {
            log.error("Erreur récupération RDV: {}", e.getMessage());
            return null;
        }
    }

    public java.util.List<Integer> getAllInfirmiersUserIds(String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            ResponseEntity<Map> res = restTemplate.exchange(
                    "http://infirmier-service:9000/api/infirmiers",
                    HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            if (res.getBody() != null) {
                Object memberObj = res.getBody().containsKey("hydra:member") ? res.getBody().get("hydra:member")
                        : res.getBody().get("member");

                if (memberObj instanceof java.util.List) {
                    java.util.List<Map<String, Object>> members = (java.util.List<Map<String, Object>>) memberObj;
                    java.util.List<Integer> ids = new java.util.ArrayList<>();

                    for (Map<String, Object> member : members) {
                        if (member.get("idUtilisateur") != null) {
                            ids.add((Integer) member.get("idUtilisateur"));
                        }
                    }
                    return ids;
                }
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer les infirmiers depuis infirmier-service : {}", e.getMessage());
        }
        return new java.util.ArrayList<>();
    }

    public String getUserEmail(Integer userId, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            ResponseEntity<Map> res = restTemplate.exchange(
                    "http://auth-service:8080/user/" + userId,
                    HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            if (res.getBody() != null && res.getBody().get("user") != null) {
                Map<String, Object> user = (Map<String, Object>) res.getBody().get("user");
                return (String) user.get("email");
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer l'email pour userId={} : {}", userId, e.getMessage());
        }
        return null;
    }
}
