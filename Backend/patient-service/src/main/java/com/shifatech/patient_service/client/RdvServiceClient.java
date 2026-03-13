package com.shifatech.patient_service.client;

import com.shifatech.patient_service.dto.CreateRendezVousRequest;
import com.shifatech.patient_service.dto.RendezVousDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RdvServiceClient {

    private final RestTemplate restTemplate;

    @Value("${rdv.service.url:http://localhost:8000}")
    private String rdvServiceUrl;

    public RendezVousDTO createAppointment(CreateRendezVousRequest request, String bearerToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (bearerToken != null) {
                headers.set("Authorization", bearerToken);
            }
            HttpEntity<CreateRendezVousRequest> entity = new HttpEntity<>(request, headers);

            String url = rdvServiceUrl + "/api/rendez_vouses";
            ResponseEntity<RendezVousDTO> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    RendezVousDTO.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Erreur lors de la création du rendez-vous: {}", e.getMessage());
            throw new RuntimeException("Erreur de communication avec le service RDV: " + e.getMessage());
        }
        return null;
    }

    public RendezVousDTO getAppointmentById(Integer id, String bearerToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            if (bearerToken != null) {
                headers.set("Authorization", bearerToken);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String url = rdvServiceUrl + "/api/rendez_vouses/" + id;
            ResponseEntity<RendezVousDTO> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    RendezVousDTO.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du rendez-vous: {}", e.getMessage());
        }
        return null;
    }

    public void cancelAppointment(Integer id, String bearerToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            // Utilisation du type de contenu merge-patch+json attendu par ApiPlatform
            headers.setContentType(MediaType.valueOf("application/merge-patch+json"));
            if (bearerToken != null) {
                headers.set("Authorization", bearerToken);
            }

            // On met le statut à false pour annuler
            Map<String, Object> body = Map.of("statut", false);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            String url = rdvServiceUrl + "/api/rendez_vouses/" + id;

            // Note: RestTemplate avec HttpURLConnection peut poser problème pour PATCH.
            // Si une erreur standard survient, l'environnement devra être configuré avec
            // HttpClient.
            restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    entity,
                    Void.class);
        } catch (Exception e) {
            log.error("Erreur lors de l'annulation du rendez-vous: {}", e.getMessage());
            throw new RuntimeException(
                    "Erreur de communication avec le service RDV lors de l'annulation: " + e.getMessage());
        }
    }
}
