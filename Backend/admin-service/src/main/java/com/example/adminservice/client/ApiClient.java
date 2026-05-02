package com.example.adminservice.client;

import com.example.adminservice.dto.external.*;
import com.example.adminservice.exception.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiClient {

    private final RestTemplate restTemplate;

    @Value("${auth.service.email}")
    private String authEmail;

    @Value("${auth.service.password}")
    private String authPassword;

    @Value("${app.rdv-service-url:http://rdv-service:9000}")
    private String rdvServiceUrl;

    @Value("${app.auth-service-url:http://auth-service:8080}")
    private String authServiceUrl;

    @Value("${app.doctor-service-url:http://doctor-service:8080}")
    private String doctorServiceUrl;

    @Value("${app.infirmier-service-url:http://infirmier-service:9000}")
    private String infirmierServiceUrl;

    @Value("${app.patient-service-url:http://patient-service:9000}")
    private String patientServiceUrl;

    private volatile String cachedToken;
    private volatile Instant tokenExpiry = Instant.EPOCH;

    // ─────────────────────────────────────────────
    // Auth
    // ─────────────────────────────────────────────

    public synchronized String fetchJwtToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry)) {
            log.debug("[AUTH] Token servi depuis le cache (expire dans {}s)",
                      tokenExpiry.getEpochSecond() - Instant.now().getEpochSecond());
            return cachedToken;
        }
        String token = doFetchToken();
        if (token != null) {
            cachedToken = token;
            tokenExpiry = Instant.now().plusSeconds(50 * 60);
        }
        return token;
    }

    private String doFetchToken() {
        try {
            Map<String, String> creds = Map.of("email", authEmail, "password", authPassword);
            ResponseEntity<Map<String, Object>> res = restTemplate.exchange(
                    authServiceUrl + "/login",
                    HttpMethod.POST,
                    new HttpEntity<>(creds),
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            if (res.getBody() == null) return null;

            Object raw = res.getBody().getOrDefault("accessToken",
                         res.getBody().get("token"));
            if (raw == null) {
                log.error("[AUTH✗] Token introuvable — clés reçues : {} — vérifiez AUTH_SERVICE_EMAIL/PASSWORD",
                          res.getBody().keySet());
                return null;
            }
            log.info("[AUTH✓] Nouveau token JWT obtenu (valide 50 min)");
            return raw.toString();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("auth-service", e);
        } catch (Exception e) {
            log.error("[AUTH] Échec récupération token : {}", e.getMessage());
            return null;
        }
    }

    public synchronized void invalidateToken() {
        cachedToken = null;
        tokenExpiry = Instant.EPOCH;
    }

    // ─────────────────────────────────────────────
    // Auth-service
    // ─────────────────────────────────────────────

    public String getUserEmail(Integer userId, String token) {
        try {
            ResponseEntity<UserResponseDTO> res = restTemplate.exchange(
                    authServiceUrl + "/user/" + userId,
                    HttpMethod.GET,
                    bearerEntity(token),
                    UserResponseDTO.class
            );
            return res.getBody() != null ? res.getBody().resolveEmail() : null;
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("auth-service", e);
        } catch (Exception e) {
            log.warn("[AUTH] getUserEmail({}) : {}", userId, e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────
    // Patient-service  — accès direct par ID
    // ─────────────────────────────────────────────

    /**
     * Résout le userId d'un patient à partir de son id patient.
     *
     * Appel direct GET /patients/{idPatient} (1 requête) — remplace l'ancien
     * getUserIdForPatient qui chargeait TOUS les patients puis filtrait en Java.
     */
    public Integer getPatientUserId(Integer idPatient, String token) {
        try {
            ResponseEntity<PatientDTO> res = restTemplate.exchange(
                    patientServiceUrl + "/patients/" + idPatient,
                    HttpMethod.GET,
                    bearerEntity(token),
                    PatientDTO.class
            );
            Integer idUser = res.getBody() != null ? res.getBody().getIdUser() : null;
            if (idUser == null) {
                log.warn("[PATIENT] getPatientUserId({}) : idUser null dans la réponse", idPatient);
            }
            return idUser;
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("patient-service", e);
        } catch (Exception e) {
            log.warn("[PATIENT] getPatientUserId({}) : {}", idPatient, e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────
    // Doctor-service
    // ─────────────────────────────────────────────

    public Integer getUserIdForDoctor(Integer idDocteur, String token) {
        DoctorDTO doctor = fetchDoctorById(idDocteur, token);
        return doctor != null ? doctor.getIdUser() : null;
    }

    public Integer getServiceIdForDoctor(Integer idDocteur, String token) {
        DoctorDTO doctor = fetchDoctorById(idDocteur, token);
        return doctor != null ? doctor.getIdService() : null;
    }

    private DoctorDTO fetchDoctorById(Integer idDocteur, String token) {
        try {
            return restTemplate.exchange(
                    doctorServiceUrl + "/" + idDocteur,
                    HttpMethod.GET,
                    bearerEntity(token),
                    DoctorDTO.class
            ).getBody();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("doctor-service", e);
        } catch (Exception e) {
            log.warn("[DOCTOR] fetchDoctorById({}) : {}", idDocteur, e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────
    // Infirmier-service
    // ─────────────────────────────────────────────

    /**
     * Retourne les userIds des infirmiers associés au service du médecin.
     *
     * Optimisation : le paramètre id_service est passé en query string pour
     * permettre un filtrage serveur si SearchFilter est configuré sur infirmier-service
     * (GET /api/infirmier_specialites?id_service={id}).
     * La vérification Java reste en filet de sécurité si le filtre est ignoré.
     */
    public List<Integer> getInfirmiersUserIdsByService(Integer idService, String token) {
        Set<Integer> specialiteIds = getSpecialiteIdsByService(idService, token);
        log.info("[INF] Service #{} → {} spécialité(s) résolue(s)", idService, specialiteIds.size());

        if (specialiteIds.isEmpty()) {
            return getAllInfirmiersUserIds(token);
        }

        return fetchAllInfirmiers(token).stream()
                .filter(inf -> inf.getIdSpecialite() != null
                        && specialiteIds.contains(inf.getIdSpecialite()))
                .map(InfirmierDTO::getIdUtilisateur)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<Integer> getAllInfirmiersUserIds(String token) {
        return fetchAllInfirmiers(token).stream()
                .map(InfirmierDTO::getIdUtilisateur)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les spécialités d'un service avec filtrage serveur si disponible.
     * Le paramètre id_service est envoyé en query string — API Platform applique
     * le filtre si @ApiFilter(SearchFilter) est configuré, l'ignore sinon.
     * Le filtre Java (.filter) garantit la cohérence dans les deux cas.
     */
    private Set<Integer> getSpecialiteIdsByService(Integer idService, String token) {
        try {
            String url = infirmierServiceUrl + "/api/infirmier_specialites?id_service=" + idService;
            ResponseEntity<ApiCollectionResponse<SpecialiteDTO>> res = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    bearerEntity(token),
                    new ParameterizedTypeReference<ApiCollectionResponse<SpecialiteDTO>>() {}
            );
            if (res.getBody() == null) return Set.of();

            Set<Integer> ids = res.getBody().getMember().stream()
                    .filter(s -> idService.equals(s.getIdService()))
                    .map(SpecialiteDTO::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            log.debug("[SPECIALITES] Service #{} → spécialités={}", idService, ids);
            return ids;
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("infirmier-service", e);
        } catch (Exception e) {
            log.warn("[SPECIALITES] getSpecialiteIdsByService({}) : {}", idService, e.getMessage());
            return Set.of();
        }
    }

    private List<InfirmierDTO> fetchAllInfirmiers(String token) {
        try {
            ResponseEntity<ApiCollectionResponse<InfirmierDTO>> res = restTemplate.exchange(
                    infirmierServiceUrl + "/api/infirmier",
                    HttpMethod.GET,
                    bearerEntity(token),
                    new ParameterizedTypeReference<ApiCollectionResponse<InfirmierDTO>>() {}
            );
            List<InfirmierDTO> list = res.getBody() != null ? res.getBody().getMember() : List.of();
            log.debug("[INFIRMIER] {} infirmier(s) récupéré(s)", list.size());
            return list;
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("infirmier-service", e);
        } catch (Exception e) {
            log.warn("[INFIRMIER] fetchAllInfirmiers : {}", e.getMessage());
            return List.of();
        }
    }

    // ─────────────────────────────────────────────
    // RDV-service
    // ─────────────────────────────────────────────

    public List<AppointmentDTO> fetchAllAppointments(String token) {
        try {
            ResponseEntity<ApiCollectionResponse<AppointmentDTO>> res = restTemplate.exchange(
                    rdvServiceUrl + "/api/rendez_vouses",
                    HttpMethod.GET,
                    bearerEntity(token),
                    new ParameterizedTypeReference<ApiCollectionResponse<AppointmentDTO>>() {}
            );
            return res.getBody() != null ? res.getBody().getMember() : List.of();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("rdv-service", e);
        } catch (Exception e) {
            log.error("[RDV] Erreur récupération RDVs : {}", e.getMessage());
            return List.of();
        }
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    private HttpEntity<Void> bearerEntity(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return new HttpEntity<>(headers);
    }
}
