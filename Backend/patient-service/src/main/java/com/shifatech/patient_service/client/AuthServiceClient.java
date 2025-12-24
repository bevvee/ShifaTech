package com.shifatech.patient_service.client;

import com.shifatech.patient_service.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceClient {

    private final RestTemplate restTemplate;

    @Value("${auth.service.url:http://localhost:8080}")
    private String authServiceUrl;

    /**
     * Récupérer les informations d'un utilisateur par son ID
     */
    public UserDTO getUserById(Long idUser) {
        try {
            String url = authServiceUrl + "/api/users/" + idUser;
            log.info("Appel au service Auth pour récupérer l'utilisateur: {}", idUser);
            return restTemplate.getForObject(url, UserDTO.class);
        } catch (Exception e) {
            log.warn("Service Auth non disponible ou utilisateur {} non trouvé. Mode développement: création d'un utilisateur fictif", idUser);
            // Mode développement : retourner un utilisateur fictif si le service Auth n'est pas disponible
            return createMockUser(idUser);
        }
    }

    /**
     * Créer un utilisateur fictif pour les tests (mode développement)
     */
    private UserDTO createMockUser(Long idUser) {
        UserDTO mockUser = new UserDTO();
        mockUser.setIdUser(idUser);
        mockUser.setNom("Dupont");
        mockUser.setPrenom("Jean");
        mockUser.setEmail("patient" + idUser + "@example.com");
        mockUser.setTelephone("+33612345678");
        mockUser.setAdresse("123 Rue Example, Paris");
        mockUser.setDateNaissance(java.time.LocalDate.of(1990, 1, 15));
        mockUser.setGenre("M");
        return mockUser;
    }

    /**
     * Mettre à jour le profil d'un utilisateur (téléphone, adresse)
     */
    public void updateUserProfile(Long idUser, String telephone, String adresse) {
        try {
            String url = authServiceUrl + "/api/users/" + idUser + "/profile";

            Map<String, String> updateData = new HashMap<>();
            if (telephone != null) {
                updateData.put("telephone", telephone);
            }
            if (adresse != null) {
                updateData.put("adresse", adresse);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(updateData, headers);

            log.info("Mise à jour du profil utilisateur: {}", idUser);
            restTemplate.exchange(url, HttpMethod.PUT, entity, Void.class);

        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du profil {}: {}", idUser, e.getMessage());
            throw new RuntimeException("Impossible de mettre à jour le profil utilisateur", e);
        }
    }
}