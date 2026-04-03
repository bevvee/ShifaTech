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
            log.info("[DEBUG] Appel Auth Service pour récupérer l'utilisateur ID: {} | URL: {}", idUser, url);
            
            HttpHeaders headers = new HttpHeaders();
            if (authHeader != null) {
                headers.set("Authorization", authHeader);
            } else {
                log.warn("[DEBUG] Aucun Authorization header fourni pour l'appel à Auth Service !");
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            log.info("[DEBUG] Réponse de Auth Service (Status: {}): {}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                Object user = body.get("user");
                if (user instanceof Map dataMap) {
                    UserDTO dto = mapToUserDTO(dataMap);
                    if (dto != null) {
                        log.info("[DEBUG] Utilisateur {} ({}) récupéré avec succès.", idUser, dto.getNom());
                    } else {
                        log.error("[DEBUG] Échec du mapping UserDTO pour l'utilisateur {}.", idUser);
                    }
                    return dto;
                } else {
                    log.error("[DEBUG] Le champ 'user' dans la réponse est absent ou de type incorrect: {}", user);
                }
            } else {
                log.error("[DEBUG] La réponse de Auth Service n'est pas successful ou vide.");
            }
        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
            log.error("[DEBUG] 401 Unauthorized lors de l'appel à Auth Service. Le token est peut-être expiré ou invalide.");
        } catch (Exception e) {
            log.error("[DEBUG] Erreur critique lors de la récupération de l'utilisateur {} : {}", idUser, e.getMessage());
            e.printStackTrace();
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
            log.debug("[DEBUG] Mapping de la map utilisateur: {}", map);
            
            // Tentative de récupération flexible pour l'id (idUser ou id_user)
            Object idObj = map.get("idUser");
            if (idObj == null) idObj = map.get("id_user");
            
            Long idUser = idObj != null ? Long.valueOf(idObj.toString()) : null;

            // Mapping des champs avec logs si null
            String nom = (String) map.get("nom");
            String prenom = (String) map.get("prenom");
            
            if (nom == null) log.warn("[DEBUG] Le champ 'nom' est null dans le mapping.");
            if (prenom == null) log.warn("[DEBUG] Le champ 'prenom' est null dans le mapping.");

            LocalDate dateNaissance = null;
            Object dob = map.get("dateNaissance");
            if (dob != null) {
                try {
                    dateNaissance = LocalDate.parse(dob.toString());
                } catch (Exception ignored) {
                    log.warn("[DEBUG] Échec du parsing de la date de naissance: {}", dob);
                }
            }

            return UserDTO.builder()
                    .idUser(idUser)
                    .nom(nom)
                    .prenom(prenom)
                    .cin((String) map.get("cin"))
                    .email((String) map.get("email"))
                    .role((String) map.get("role"))
                    .sexe((String) map.get("sexe"))
                    .statut(map.get("statut") instanceof Boolean b ? b : null)
                    .dateNaissance(dateNaissance)
                    .telephone((String) map.get("telephone"))
                    .adresse((String) map.get("adresse"))
                    .build();
        } catch (Exception e) {
            log.error("[DEBUG] Exception inattendue lors du mapping de UserDTO: {}", e.getMessage());
            return null;
        }
    }
}
