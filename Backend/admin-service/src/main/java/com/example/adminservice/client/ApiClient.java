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

    /**
     *
     * @throws ServiceUnavailableException 
     * @return 
     */
    public synchronized String fetchJwtToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }
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
                log.error("[AUTH] Clé token introuvable dans la réponse : {}", res.getBody().keySet());
                return null;
            }
            cachedToken = raw.toString();
            tokenExpiry = Instant.now().plusSeconds(50 * 60);
            log.debug("[AUTH] Nouveau token obtenu, valide 50 min");
            return cachedToken;
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


    public Integer getUserIdForPatient(Integer idPatient, String token) {
        try {
            ResponseEntity<List<PatientDTO>> res = restTemplate.exchange(
                    patientServiceUrl + "/patients",
                    HttpMethod.GET,
                    bearerEntity(token),
                    new ParameterizedTypeReference<List<PatientDTO>>() {}
            );
            if (res.getBody() == null) return null;
            return res.getBody().stream()
                    .filter(p -> idPatient.equals(p.getIdPatient()))
                    .map(PatientDTO::getIdUser)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("patient-service", e);
        } catch (Exception e) {
            log.warn("[PATIENT] getUserIdForPatient({}) : {}", idPatient, e.getMessage());
            return null;
        }
    }
    public Integer getUserIdForDoctor(Integer idDocteur, String token) {
        DoctorDTO doctor = fetchDoctorById(idDocteur, token);
        return doctor != null ? doctor.getIdUser() : null;
    }

    public Integer getServiceIdForDoctor(Integer idDocteur, String token) {
        DoctorDTO doctor = fetchDoctorById(idDocteur, token);
        return doctor != null ? doctor.getIdService() : null;
    }

    // Un seul appel HTTP pour les deux méthodes publiques ci-dessus
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
    public List<Integer> getAllInfirmiersUserIds(String token) {
        return fetchAllInfirmiers(token).stream()
                .map(InfirmierDTO::getIdUtilisateur)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<Integer> getInfirmiersUserIdsByService(Integer idService, String token) {
        Set<Integer> specialitesDuService = getSpecialiteIdsByService(idService, token);
        log.info("[INF] Service #{} -> spécialités={}", idService, specialitesDuService);

        return fetchAllInfirmiers(token).stream()
                .filter(inf -> inf.getIdSpecialite() != null
                        && specialitesDuService.contains(inf.getIdSpecialite()))
                .map(InfirmierDTO::getIdUtilisateur)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
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
            log.info("[INFIRMIER] {} infirmiers récupérés", list.size());
            return list;
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("infirmier-service", e);
        } catch (Exception e) {
            log.warn("[INFIRMIER] fetchAllInfirmiers : {}", e.getMessage());
            return List.of();
        }
    }

    private Set<Integer> getSpecialiteIdsByService(Integer idService, String token) {
        try {
            ResponseEntity<ApiCollectionResponse<SpecialiteDTO>> res = restTemplate.exchange(
                    infirmierServiceUrl + "/api/infirmier_specialites",
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

            log.info("[SPECIALITES] Service #{} -> spécialités={}", idService, ids);
            return ids;
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("infirmier-service", e);
        } catch (Exception e) {
            log.warn("[SPECIALITES] getSpecialiteIdsByService({}) : {}", idService, e.getMessage());
            return Set.of();
        }
    }

    private HttpEntity<Void> bearerEntity(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return new HttpEntity<>(headers);
    }
}
