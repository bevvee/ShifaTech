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

    public String fetchJwtToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }
        synchronized (this) {
            if (cachedToken != null && Instant.now().isBefore(tokenExpiry)) {
                return cachedToken;
            }
            String token = doFetchToken();
            if (token != null) {
                cachedToken = token;
                tokenExpiry = Instant.now().plusSeconds(50 * 60);
            }
            return token;
        }
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

    public String getUserEmail(Integer userId) {
        try {
            ResponseEntity<UserResponseDTO> res = restTemplate.exchange(
                    authServiceUrl + "/user/" + userId,
                    HttpMethod.GET,
                    bearerEntity(),
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

    public Integer getPatientUserId(Integer idPatient) {
        try {
            ResponseEntity<PatientDTO> res = restTemplate.exchange(
                    patientServiceUrl + "/patients/" + idPatient,
                    HttpMethod.GET,
                    bearerEntity(),
                    PatientDTO.class
            );
            return res.getBody() != null ? res.getBody().getIdUser() : null;
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

    public Integer getUserIdForDoctor(Integer idDocteur) {
        DoctorDTO doctor = fetchDoctorById(idDocteur);
        return doctor != null ? doctor.getIdUser() : null;
    }

    public Integer getServiceIdForDoctor(Integer idDocteur) {
        DoctorDTO doctor = fetchDoctorById(idDocteur);
        return doctor != null ? doctor.getIdService() : null;
    }

    /**
     * Retourne le nom complet du docteur ("Dr. Prénom NOM") depuis le doctor-service.
     * Exemple : "Dr. Jean DUPONT"
     */
    public String getDoctorFullName(Integer idDocteur) {
        DoctorDTO doctor = fetchDoctorById(idDocteur);
        if (doctor == null) return "Dr. Inconnu";
        String prenom = (doctor.getPrenom() != null && !doctor.getPrenom().isBlank()) ? doctor.getPrenom() : "";
        String nom    = (doctor.getNom()    != null && !doctor.getNom().isBlank())    ? doctor.getNom().toUpperCase() : "";
        String full   = (prenom + " " + nom).trim();
        return full.isBlank() ? "Dr. Inconnu" : "Dr. " + full;
    }

    private DoctorDTO fetchDoctorById(Integer idDocteur) {
        try {
            return restTemplate.exchange(
                    doctorServiceUrl + "/" + idDocteur,
                    HttpMethod.GET,
                    bearerEntity(),
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

    public List<Integer> getInfirmiersUserIdsByService(Integer idService) {
        Set<Integer> specialiteIds = getSpecialiteIdsByService(idService);
        if (specialiteIds.isEmpty()) return getAllInfirmiersUserIds();

        return fetchAllInfirmiers().stream()
                .filter(inf -> inf.getIdSpecialite() != null
                        && specialiteIds.contains(inf.getIdSpecialite()))
                .map(InfirmierDTO::getIdUtilisateur)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<Integer> getAllInfirmiersUserIds() {
        return fetchAllInfirmiers().stream()
                .map(InfirmierDTO::getIdUtilisateur)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    private Set<Integer> getSpecialiteIdsByService(Integer idService) {
        try {
            String url = infirmierServiceUrl + "/api/infirmier_specialites?id_service=" + idService;
            ResponseEntity<ApiCollectionResponse<SpecialiteDTO>> res = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    bearerEntity(),
                    new ParameterizedTypeReference<ApiCollectionResponse<SpecialiteDTO>>() {}
            );
            if (res.getBody() == null) return Set.of();

            return res.getBody().getMember().stream()
                    .filter(s -> idService.equals(s.getIdService()))
                    .map(SpecialiteDTO::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("infirmier-service", e);
        } catch (Exception e) {
            log.warn("[SPECIALITES] getSpecialiteIdsByService({}) : {}", idService, e.getMessage());
            return Set.of();
        }
    }

    private List<InfirmierDTO> fetchAllInfirmiers() {
        try {
            ResponseEntity<ApiCollectionResponse<InfirmierDTO>> res = restTemplate.exchange(
                    infirmierServiceUrl + "/api/infirmier",
                    HttpMethod.GET,
                    bearerEntity(),
                    new ParameterizedTypeReference<ApiCollectionResponse<InfirmierDTO>>() {}
            );
            return res.getBody() != null ? res.getBody().getMember() : List.of();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("infirmier-service", e);
        } catch (Exception e) {
            log.warn("[INFIRMIER] fetchAllInfirmiers : {}", e.getMessage());
            return List.of();
        }
    }

    public List<Integer> getSecretairesUserIds() {
        try {
            ResponseEntity<List<UserResponseDTO>> res = restTemplate.exchange(
                    authServiceUrl + "/users/role/SECRETAIRE",
                    HttpMethod.GET,
                    bearerEntity(),
                    new ParameterizedTypeReference<List<UserResponseDTO>>() {}
            );
            return (res.getBody() != null ? res.getBody() : new ArrayList<UserResponseDTO>()).stream()
                    .map(UserResponseDTO::getId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("auth-service", e);
        } catch (Exception e) {
            log.warn("[SECRETAIRE] getSecretairesUserIds : {}", e.getMessage());
            return List.of();
        }
    }

    // ─────────────────────────────────────────────
    // RDV-service
    // ─────────────────────────────────────────────

    public List<AppointmentDTO> fetchAllAppointments() {
        try {
            ResponseEntity<ApiCollectionResponse<AppointmentDTO>> res = restTemplate.exchange(
                    rdvServiceUrl + "/api/rendez_vouses",
                    HttpMethod.GET,
                    bearerEntity(),
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

    private HttpEntity<Void> bearerEntity() {
        String token = fetchJwtToken();
        HttpHeaders headers = new HttpHeaders();
        if (token != null) headers.setBearerAuth(token);
        return new HttpEntity<>(headers);
    }
}
