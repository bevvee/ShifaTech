package com.shifatech.patient_service.client;

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

            String url = authServiceUrl + "/api/auth/profile";
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                Object data = body.get("data");
                if (data instanceof Map dataMap) {
                    return mapToUserDTO(dataMap);
                }
            }
        } catch (Exception e) {
            log.debug("Erreur appel auth /profile: {}", e.getMessage());
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
