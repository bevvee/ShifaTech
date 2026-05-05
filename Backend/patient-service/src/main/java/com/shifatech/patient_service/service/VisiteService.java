package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.AuthServiceClient;
import com.shifatech.patient_service.dto.CreateVisiteRequest;
import com.shifatech.patient_service.dto.VisiteDTO;
import com.shifatech.patient_service.entity.DossierMedical;
import com.shifatech.patient_service.entity.Patient;
import com.shifatech.patient_service.entity.Visite;
import com.shifatech.patient_service.exception.ResourceNotFoundException;
import com.shifatech.patient_service.repository.DossierMedicalRepository;
import com.shifatech.patient_service.repository.PatientRepository;
import com.shifatech.patient_service.repository.VisiteRepository;
import com.shifatech.patient_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VisiteService {

    private final VisiteRepository visiteRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final PatientRepository patientRepository;
    private final AuthServiceClient authServiceClient;
    private final JwtUtil jwtUtil;

    @Value("${wound.service.public-base:/wound}")
    private String woundServicePublicBase;

    public VisiteDTO createVisite(CreateVisiteRequest request, Long createdBy, String authHeader) {
        if (!isInfirmier() && !isAdmin() && !isSecretaire()) {
            throw new AccessDeniedException(
                    "Seul un infirmier, un secrétaire ou un administrateur peut créer une visite.");
        }
        log.info("Création d'une visite pour le dossier ID: {}", request.getIdDossier());

        // Seuls les médecins ou admins peuvent créer des visites
        Long idDossier = request.getIdDossier();
        if (idDossier == null || !dossierMedicalRepository.existsById(idDossier)) {
            throw new ResourceNotFoundException("DossierMedical", "id", idDossier);
        }
        DossierMedical dossier = dossierMedicalRepository.findById(idDossier)
                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "id", idDossier));

        Long idPatient = dossier.getIdPatient();
        if (idPatient == null) {
            throw new ResourceNotFoundException("Patient", "dossierId", idDossier);
        }
        Patient patient = patientRepository.findById(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", idPatient));

        // Seuls les infirmiers ou admins peuvent créer des visites
        // Exception pour le patient lui-même (Pour Testing)
        if (!isAdmin() && !isInfirmier() && !isSecretaire() && !patient.getIdUser().equals(createdBy)) {
            throw new AccessDeniedException(
                    "Seul un infirmier, un secrétaire ou un administrateur peut créer une visite.");
        }

        Visite visite = new Visite();
        visite.setIdDoctor(request.getIdDoctor());
        visite.setIdDossier(request.getIdDossier());
        visite.setTypeVisite(request.getTypeVisite());
        visite.setTypeBlessure(request.getTypeBlessure());
        visite.setIdBodyPart(request.getIdBodyPart());

        // 🛡️ Validation métier : si BLESSURE, typeBlessure est obligatoire.
        if (request.getTypeVisite() == com.shifatech.patient_service.entity.TypeVisite.BLESSURE
                && request.getTypeBlessure() == null) {
            throw new IllegalArgumentException("Le type de blessure est obligatoire pour une visite de type BLESSURE.");
        }
        // Assouplissement : on ignore si typeBlessure est présent pour une CONSULTATION
        // au lieu de lancer une exception,
        // ou on le force à null si c'est ce que l'on veut.
        if (request.getTypeVisite() == com.shifatech.patient_service.entity.TypeVisite.CONSULTATION) {
            visite.setTypeBlessure(null);
        } else {
            visite.setTypeBlessure(request.getTypeBlessure());
        }

        visite.setPlanTraitement(request.getPlanTraitement());
        visite.setObservations(request.getObservations());
        // analysis image URLs
        visite.setOverlayUrl(normalizeImageReferenceForStorage(request.getOverlayUrl()));
        visite.setMaskUrl(normalizeImageReferenceForStorage(request.getMaskUrl()));
        visite.setOriginalImageUrl(normalizeImageReferenceForStorage(request.getOriginalImageUrl()));
        visite.setCreatedBy(createdBy);
        visite.setStatus(Visite.StatusVisite.OPEN);

        Visite savedVisite = visiteRepository.save(visite);
        return mapToDTO(savedVisite, authHeader);
    }

    @Transactional(readOnly = true)
    public List<VisiteDTO> getVisitesByDossierId(Long idDossier, String authHeader) {
        log.info("[DIAGNOSTIC] Récupération des visites pour le dossier ID: {}", idDossier);

        DossierMedical dossier = dossierMedicalRepository.findById(idDossier)
                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "id", idDossier));

        Patient patient = patientRepository.findById(dossier.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id",
                        dossier.getIdPatient()));

        checkReadAccess(patient);

        List<Visite> visits = visiteRepository.findByIdDossier(idDossier);
        log.info("[DIAGNOSTIC] Trouvé {} visites en base pour le dossier {}", visits.size(), idDossier);

        return visits.stream()
                .map(v -> mapToDTO(v, authHeader))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VisiteDTO getVisiteById(Long id, String authHeader) {
        log.info("Récupération de la visite ID: {}", id);
        Visite visite = visiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visite", "id", id));

        DossierMedical dossier = dossierMedicalRepository.findById(visite.getIdDossier())
                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "id",
                        visite.getIdDossier()));

        Patient patient = patientRepository.findById(dossier.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id",
                        dossier.getIdPatient()));

        checkReadAccess(patient);

        return mapToDTO(visite, authHeader);
    }

    @Transactional(readOnly = true)
    public List<VisiteDTO> getAllVisites(String authHeader) {
        if (!isAdmin() && !isDocteur() && !isInfirmier() && !isSecretaire()) {
            throw new AccessDeniedException(
                    "Seul le personnel médical ou administratif autorisé peut lister les visites.");
        }
        log.info("Récupération de toutes les visites");
        return visiteRepository.findAll().stream()
                .map(v -> mapToDTO(v, authHeader))
                .collect(Collectors.toList());
    }

    public VisiteDTO updateVisite(Long id, CreateVisiteRequest request, String authHeader) {
        if (!isInfirmier() && !isDocteur() && !isAdmin() && !isSecretaire()) {
            throw new AccessDeniedException("Seul un infirmier, un médecin ou un secrétaire peut modifier une visite.");
        }
        log.info("Mise à jour de la visite ID: {}", id);
        Visite visite = visiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visite", "id", id));

        visite.setPlanTraitement(request.getPlanTraitement());
        visite.setObservations(request.getObservations());
        visite.setOverlayUrl(normalizeImageReferenceForStorage(request.getOverlayUrl()));
        visite.setMaskUrl(normalizeImageReferenceForStorage(request.getMaskUrl()));
        visite.setOriginalImageUrl(normalizeImageReferenceForStorage(request.getOriginalImageUrl()));
        visite.setTypeVisite(request.getTypeVisite());
        visite.setTypeBlessure(request.getTypeBlessure());
        visite.setIdBodyPart(request.getIdBodyPart());

        if (request.getStatus() != null) {
            visite.setStatus(request.getStatus());
            if (request.getStatus() == com.shifatech.patient_service.entity.Visite.StatusVisite.CLOSED) {
                visite.setDateFermeture(java.time.LocalDateTime.now());
            }
        }

        // 🛡️ Validation métier identique pour l'update
        if (request.getTypeVisite() == com.shifatech.patient_service.entity.TypeVisite.BLESSURE
                && request.getTypeBlessure() == null) {
            throw new IllegalArgumentException("Le type de blessure est obligatoire pour une visite de type BLESSURE.");
        }

        return mapToDTO(visiteRepository.save(visite), authHeader);
    }

    public void deleteVisite(Long id) {
        if (!isInfirmier() && !isAdmin()) {
            throw new AccessDeniedException(
                    "Seul un infirmier ou un administrateur peut supprimer une visite.");
        }
        log.info("Suppression de la visite ID: {}", id);
        Visite visite = visiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visite", "id", id));
        visite.setStatus(Visite.StatusVisite.CLOSED);
        visiteRepository.save(visite);
    }

    private void checkReadAccess(Patient patient) {
        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !isDocteur() && !isInfirmier() && !isSecretaire()
                && !patient.getIdUser().equals(currentUserId)) {
            throw new AccessDeniedException("Accès refusé aux visites de ce patient.");
        }
    }

    private boolean hasWriteAccess() {
        return isAdmin() || isDocteur() || isInfirmier();
    }

    private boolean isAdmin() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null)
            return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isDocteur() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null)
            return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTEUR"));
    }

    private boolean isInfirmier() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null)
            return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_INFIRMIER"));
    }

    private boolean isSecretaire() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null)
            return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SECRETAIRE"));
    }

    private VisiteDTO mapToDTO(Visite visite, String authHeader) {
        VisiteDTO dto = VisiteDTO.builder()
                .idVisite(visite.getIdVisite())
                .idDoctor(visite.getIdDoctor())
                .idDossier(visite.getIdDossier())
                .status(visite.getStatus())
                .typeVisite(visite.getTypeVisite())
                .typeBlessure(visite.getTypeBlessure())
                .idBodyPart(visite.getIdBodyPart())
                .dateCreation(visite.getDateCreation())
                .planTraitement(visite.getPlanTraitement())
                .observations(visite.getObservations())
                .overlayUrl(toFreshAccessUrl(visite.getOverlayUrl()))
                .maskUrl(toFreshAccessUrl(visite.getMaskUrl()))
                .originalImageUrl(toFreshAccessUrl(visite.getOriginalImageUrl()))
                .dateFermeture(visite.getDateFermeture())
                .build();

        // Récupérer les infos du patient via le dossier
        dossierMedicalRepository.findById(visite.getIdDossier()).ifPresent(dossier -> {
            patientRepository.findById(dossier.getIdPatient()).ifPresent(patient -> {
                dto.setNumDossier(patient.getNumDossier());
                if (patient.getIdUser() != null) {
                    try {
                        var user = authServiceClient.getUserById(patient.getIdUser(),
                                authHeader);
                        if (user != null) {
                            dto.setNomPatient(user.getNom() + " " + user.getPrenom());
                        }
                    } catch (Exception e) {
                        log.warn("Erreur récupération patient pour visite: {}", e.getMessage());
                    }
                }
            });
        });

        return dto;
    }

    private String toFreshAccessUrl(String storedValue) {
        String objectName = extractObjectName(storedValue);
        if (objectName == null) {
            return storedValue;
        }

        String base = (woundServicePublicBase == null || woundServicePublicBase.isBlank())
                ? "/wound"
                : woundServicePublicBase.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }

        return base + "/signed-url?object_name="
                + URLEncoder.encode(objectName, StandardCharsets.UTF_8);
    }

    private String normalizeImageReferenceForStorage(String value) {
        String objectName = extractObjectName(value);
        if (objectName != null) {
            return objectName;
        }
        return value;
    }

    private String extractObjectName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String cleaned = value.trim();

        // Already an object key (preferred storage format).
        if (!cleaned.contains("://") && !cleaned.startsWith("/") && !cleaned.contains("?")) {
            return cleaned;
        }

        // Handle /wound/signed-url?object_name=... form.
        String fromSignedEndpoint = extractObjectNameFromSignedEndpoint(cleaned);
        if (fromSignedEndpoint != null) {
            return fromSignedEndpoint;
        }

        try {
            URI uri = URI.create(cleaned);
            String path = uri.getPath() == null ? "" : decode(uri.getPath());

            int bucketIndex = path.indexOf("/wound-images/");
            if (bucketIndex >= 0) {
                String name = path.substring(bucketIndex + "/wound-images/".length());
                if (!name.isBlank()) {
                    return trimSlashes(name);
                }
            }

            String rawPath = trimSlashes(path);
            if (rawPath.startsWith("wound-images/")) {
                String name = rawPath.substring("wound-images/".length());
                if (!name.isBlank()) {
                    return trimSlashes(name);
                }
            }
        } catch (Exception ignored) {
            // Fall through to conservative checks below.
        }

        // If we only have a path-like value, keep it as key when meaningful.
        String normalized = cleaned;
        if (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (normalized.startsWith("wound-images/")) {
            normalized = normalized.substring("wound-images/".length());
            if (!normalized.isBlank()) {
                return trimSlashes(normalized);
            }
        }

        return null;
    }

    private String extractObjectNameFromSignedEndpoint(String value) {
        String lower = value.toLowerCase(Locale.ROOT);
        if (!lower.contains("signed-url") || !value.contains("object_name=")) {
            return null;
        }

        int idx = value.indexOf("object_name=");
        if (idx < 0) {
            return null;
        }

        String raw = value.substring(idx + "object_name=".length());
        int amp = raw.indexOf('&');
        if (amp >= 0) {
            raw = raw.substring(0, amp);
        }

        if (raw.isBlank()) {
            return null;
        }

        String decoded = decode(raw);
        // Recursive call allows object_name to be either a key or a full URL.
        String nested = extractObjectName(decoded);
        return nested != null ? nested : trimSlashes(decoded);
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private String trimSlashes(String value) {
        String v = value;
        while (v.startsWith("/")) {
            v = v.substring(1);
        }
        while (v.endsWith("/")) {
            v = v.substring(0, v.length() - 1);
        }
        return v;
    }
}
