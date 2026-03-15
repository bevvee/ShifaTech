package com.shifatech.patient_service.client;

import com.shifatech.patient_service.dto.RegisterRequest;
import com.shifatech.patient_service.dto.UpdateUserRequest;
import com.shifatech.patient_service.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Map;

/**
 * Client pour communiquer avec auth-service.
 * Récupère les infos utilisateur pour enrichir les PatientDTO.
 *
 * Note: auth-service doit exposer GET /api/auth/users/{id} pour que cette
 * intégration fonctionne. En attendant, getUserById retourne null.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthServiceClient {

    private final RestTemplate restTemplate;

    @Value("${auth.service.url:http://localhost:8081}")
    private String authServiceUrl;

    /**
     * Récupère le profil utilisateur via GET /api/auth/profile avec le token.
     * Le token doit appartenir à l'utilisateur demandé.
     *
     * @param bearerToken Token JWT avec préfixe "Bearer "
     * @return UserDTO ou null si indisponible
     */
    public UserDTO getProfileWithToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return null;
        }
        String token = bearerToken.substring(7);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String url = authServiceUrl + "/profile";
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                Object user = body.get("user");
                if (user instanceof Map dataMap) {
                    return mapToUserDTO(dataMap);
                }
            }
        } catch (Exception e) {
            log.debug("Erreur appel auth /profile: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Récupère les infos d'un utilisateur par son ID (appel Admin/Docteur).
     */
    public UserDTO getUserById(Long idUser, String authHeader) {
        if (idUser == null) return null;
        try {
            String url = authServiceUrl + "/user/" + idUser;
            log.info("Appel Auth Service: GET {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            if (authHeader != null) {
                headers.set("Authorization", authHeader);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                Object user = body.get("user");
                if (user instanceof Map dataMap) {
                    return mapToUserDTO(dataMap);
                }
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de l'utilisateur {} : {}", idUser, e.getMessage());
        }
        return null;
    }

    /**
     * Enregistre un nouvel utilisateur dans auth-service.
     */
    public UserDTO registerUser(RegisterRequest request) {
        try {
            String url = authServiceUrl + "/register";
            log.info("Appel Auth Service: POST {}", url);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                Object user = body.get("user");
                if (user instanceof Map dataMap) {
                    return mapToUserDTO(dataMap);
                }
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'enregistrement de l'utilisateur : {}", e.getMessage());
        }
        return null;
    }

    /**
     * Met à jour un utilisateur dans auth-service.
     */
    public UserDTO updateUser(Long userId, UpdateUserRequest request, String authHeader) {
        if (userId == null) return null;
        try {
            String url = authServiceUrl + "/update/" + userId;
            log.info("Appel Auth Service: PUT {}", url);

            HttpHeaders headers = new HttpHeaders();
            if (authHeader != null) {
                headers.set("Authorization", authHeader);
            }
            HttpEntity<UpdateUserRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                Object user = body.get("user");
                if (user instanceof Map dataMap) {
                    return mapToUserDTO(dataMap);
                }
            }
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de l'utilisateur {} : {}", userId, e.getMessage());
        }
        return null;
    }

    private UserDTO mapToUserDTO(Map<?, ?> map) {
        try {
            Long idUser = map.get("idUser") != null
                    ? Long.valueOf(map.get("idUser").toString())
                    : null;
            LocalDate dateNaissance = null;
            if (map.get("dateNaissance") != null) {
                try {
                    dateNaissance = LocalDate.parse(map.get("dateNaissance").toString());
                } catch (Exception ignored) {}
            }
            return UserDTO.builder()
                    .idUser(idUser)
                    .nom((String) map.get("nom"))
                    .prenom((String) map.get("prenom"))
                    .cin((String) map.get("cin"))
                    .email((String) map.get("email"))
                    .role((String) map.get("role"))
                    .sexe((String) map.get("sexe"))
                    .statut(map.get("statut") != null ? (Boolean) map.get("statut") : null)
                    .dateNaissance(dateNaissance)
                    .telephone((String) map.get("telephone"))
                    .adresse((String) map.get("adresse"))
                    .build();
        } catch (Exception e) {
            return null;
        }
    }
}
