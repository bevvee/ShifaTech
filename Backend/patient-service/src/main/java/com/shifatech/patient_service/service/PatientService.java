package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.AuthServiceClient;
import com.shifatech.patient_service.dto.CreatePatientRequest;
import com.shifatech.patient_service.dto.PatientDTO;
import com.shifatech.patient_service.dto.RegisterRequest;
import com.shifatech.patient_service.dto.UpdatePatientRequest;
import com.shifatech.patient_service.dto.UpdateUserRequest;
import com.shifatech.patient_service.dto.UserDTO;
import com.shifatech.patient_service.entity.DossierMedical;
import com.shifatech.patient_service.entity.Patient;
import com.shifatech.patient_service.exception.ResourceAlreadyExistsException;
import com.shifatech.patient_service.exception.ResourceNotFoundException;
import com.shifatech.patient_service.repository.DossierMedicalRepository;
import com.shifatech.patient_service.repository.PatientRepository;
import com.shifatech.patient_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final AuthServiceClient authServiceClient;
    private final JwtUtil jwtUtil;

    public PatientDTO createPatient(CreatePatientRequest request, Long createdBy, String authHeader) {
        log.info("Création d'un nouveau patient. idUser: {}, nom: {}", request.getIdUser(), request.getNom());

        Long idUser = request.getIdUser();

        // 1. Si pas d'idUser, on crée le compte dans Auth Service
        if (idUser == null) {
            log.info("idUser non fourni, création d'un compte utilisateur dans Auth Service");
            RegisterRequest registerRequest = RegisterRequest.builder()
                    .nom(request.getNom())
                    .prenom(request.getPrenom())
                    .cin(request.getCin())
                    .email(request.getEmail())
                    .password("ShifaTech2026") // Mot de passe temporaire par défaut
                    .passwordConfirmation("ShifaTech2026")
                    .role("PATIENT")
                    .sexe(request.getSexe())
                    .dateNaissance(request.getDateNaissance())
                    .telephone(request.getTelephone())
                    .adresse(request.getAdresse())
                    .build();

            UserDTO createdUser = authServiceClient.registerUser(registerRequest);
            if (createdUser == null || createdUser.getIdUser() == null) {
                log.error("Échec de la création automatique de l'utilisateur dans le service Auth pour {}", request.getEmail());
                throw new RuntimeException("Échec de la création de l'utilisateur dans le service Auth");
            }
            idUser = createdUser.getIdUser();
            log.info("Utilisateur créé avec succès dans Auth Service. idUser: {}", idUser);
        } else {
            log.info("idUser {} fourni, pas de création d'utilisateur nécessaire.", idUser);
        }

        if (patientRepository.existsByIdUser(idUser)) {
            log.warn("Tentative de création d'un patient existant pour idUser: {}", idUser);
            throw new ResourceAlreadyExistsException("Patient", "idUser", idUser);
        }

        Patient patient = new Patient();
        patient.setIdUser(idUser);
        patient.setNumDossier(generateNumDossier());
        patient.setAssurance(request.getAssurance());
        patient.setNumeroAssurance(request.getNumeroAssurance());
        patient.setStatut(true);
        patient.setCreatedBy(createdBy);

        try {
            Patient savedPatient = patientRepository.save(patient);
            log.info("Patient enregistré en base avec succès. ID: {}, NumDossier: {}", 
                    savedPatient.getIdPatient(), savedPatient.getNumDossier());
            return mapToDTO(savedPatient, authHeader);
        } catch (Exception e) {
            log.error("Erreur fatale lors de la sauvegarde du patient pour idUser {}: {}", idUser, e.getMessage());
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long id, String authHeader) {
        log.info("Récupération du patient ID: {}", id);
        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        // Sécurité : Vérifier que c'est le patient lui-même, un médecin, infirmier, secrétaire ou un admin
        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !isDocteur() && !isInfirmier() && !isSecretaire() &&
                !patient.getIdUser().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé au dossier de ce patient.");
        }

        return mapToDTO(patient, authHeader);
    }

    @Transactional(readOnly = true)
    public PatientDTO getPatientByUserId(Long userId, String authHeader) {
        log.info("Récupération du patient par User ID: {}", userId);

        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !isDocteur() && !isInfirmier() && !isSecretaire() &&
                !userId.equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé au profil de cet utilisateur.");
        }

        Patient patient = patientRepository.findByIdUser(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "idUser", userId));
        return mapToDTO(patient, authHeader);
    }

    @Transactional(readOnly = true)
    public List<PatientDTO> getAllPatients(String authHeader) {
        if (!isAdmin() && !isDocteur() && !isInfirmier() && !isSecretaire()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seuls les médecins, infirmiers, secrétaires ou administrateurs peuvent lister tous les patients.");
        }
        log.info("Récupération de tous les patients actifs");
        return patientRepository.findAllActive().stream()
                .map(p -> mapToDTO(p, authHeader))
                .collect(Collectors.toList());
    }

    /**
     * Récupération interne pour les autres microservices.
     * Ignore les vérifications de rôles utilisateur.
     */
    @Transactional(readOnly = true)
    public PatientDTO getPatientDetailsInternal(Long id, String authHeader) {
        log.info("[INTERNAL] Récupération détaillée du patient ID: {}", id);
        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return mapToDTOInternal(patient, authHeader);
    }

    /**
     * Récupération en masse pour les autres microservices.
     */
    @Transactional(readOnly = true)
    public List<PatientDTO> getPatientsBulkInternal(List<Long> ids, String authHeader) {
        log.info("[INTERNAL] Récupération en masse de {} patients", ids.size());
        return patientRepository.findAllById(ids).stream()
                .filter(p -> p.getDeletedAt() == null)
                .map(p -> mapToDTOInternal(p, authHeader))
                .collect(Collectors.toList());
    }

    public PatientDTO updatePatient(Long id, UpdatePatientRequest request, Long updatedBy, String authHeader) {
        log.info("Mise à jour du patient ID: {}", id);

        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        if (!isAdmin() && !isDocteur() && !isInfirmier() && !isSecretaire() && !patient.getIdUser().equals(updatedBy)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Vous ne pouvez modifier que votre propre dossier patient (sauf si vous êtes personnel médical/admin).");
        }

        if (request.getAssurance() != null)
            patient.setAssurance(request.getAssurance());
        if (request.getNumeroAssurance() != null)
            patient.setNumeroAssurance(request.getNumeroAssurance());
        if (request.getStatut() != null)
            patient.setStatut(request.getStatut());

        patient.setUpdatedBy(updatedBy);

        // Synchroniser avec Auth-Service si des champs utilisateur sont présents
        if (patient.getIdUser() != null && (request.getNom() != null || request.getPrenom() != null || 
            request.getEmail() != null || request.getTelephone() != null || request.getSexe() != null ||
            request.getDateNaissance() != null || request.getAdresse() != null)) {
            
            log.info("Synchronisation des modifications avec Auth-Service pour idUser: {}", patient.getIdUser());
            UpdateUserRequest authSyncRequest = UpdateUserRequest.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .sexe(request.getSexe())
                .dateNaissance(request.getDateNaissance())
                .adresse(request.getAdresse())
                .build();
                
            authServiceClient.updateUser(patient.getIdUser(), authSyncRequest, authHeader);
        }

        Patient updatedPatient = patientRepository.save(patient);
        log.info("Patient mis à jour avec succès. ID: {}", updatedPatient.getIdPatient());

        return mapToDTO(updatedPatient, authHeader);
    }

    public void deletePatient(Long id, Long deletedBy) {
        log.info("Suppression (soft delete) du patient ID: {}", id);

        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        if (!isAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seuls les administrateurs peuvent supprimer un dossier patient.");
        }

        patient.setDeletedAt(LocalDateTime.now());
        patient.setDeletedBy(deletedBy);
        patient.setStatut(false);

        patientRepository.save(patient);

        // Supprimer aussi le dossier médical s'il existe
        dossierMedicalRepository.findByIdPatient(id).ifPresent(dossier -> {
            dossier.setDeletedAt(LocalDateTime.now());
            dossier.setStatus(DossierMedical.StatusDossier.ARCHIVED);
            dossierMedicalRepository.save(dossier);
            log.info("Dossier médical associé (ID: {}) supprimé (soft delete).", dossier.getIdDossier());
        });

        log.info("Patient supprimé avec succès. ID: {}", id);
    }

    private PatientDTO mapToDTO(Patient patient, String authHeader) {
        PatientDTO dto = buildBaseDTO(patient);

        if (patient.getIdUser() != null) {
            UserDTO userInfo = null;
            
            // 1. Tenter de récupérer les infos via le token (si c'est le patient lui-même)
            if (authHeader != null) {
                Long tokenUserId = jwtUtil.getUserIdFromToken();
                if (tokenUserId != null && tokenUserId.equals(patient.getIdUser())) {
                    log.info("[DEBUG] Patient {}: Le demandeur est le patient lui-même. Récupération du profil...", patient.getIdPatient());
                    userInfo = authServiceClient.getProfileWithToken(authHeader);
                }
            }
            
            // 2. Si non récupéré et que le demandeur est Admin/Docteur/Infirmier/Secretaire, utiliser getUserById
            if (userInfo == null && (isAdmin() || isDocteur() || isInfirmier() || isSecretaire())) {
                log.info("[DEBUG] Patient {}: Le demandeur a des droits d'accès. Récupération via getUserById(idUser: {})...", 
                        patient.getIdPatient(), patient.getIdUser());
                userInfo = authServiceClient.getUserById(patient.getIdUser(), authHeader);
            }

            if (userInfo != null) {
                enrichWithUserInfo(dto, userInfo, patient.getIdUser());
                log.info("[DEBUG] Patient {}: Enrichi avec succès -> {} {}", 
                        patient.getIdPatient(), dto.getNom(), dto.getPrenom());
            } else {
                log.warn("[DEBUG] Patient {}: Aucune info utilisateur trouvée (userInfo est NULL).", patient.getIdPatient());
            }
        } else {
            log.warn("[DEBUG] Patient {}: idUser est NULL !", patient.getIdPatient());
        }

        return dto;
    }

    /**
     * Version interne de mapToDTO qui récupère TOUJOURS les infos utilisateur 
     * sans vérifier les rôles du demandeur actuel (SecurityContext).
     */
    private PatientDTO mapToDTOInternal(Patient patient, String authHeader) {
        PatientDTO dto = buildBaseDTO(patient);
        if (patient.getIdUser() != null) {
            UserDTO userInfo = authServiceClient.getUserById(patient.getIdUser(), authHeader);
            enrichWithUserInfo(dto, userInfo, patient.getIdUser());
        }
        return dto;
    }

    private PatientDTO buildBaseDTO(Patient patient) {
        return PatientDTO.builder()
                .idPatient(patient.getIdPatient())
                .idUser(patient.getIdUser())
                .numDossier(patient.getNumDossier())
                .assurance(patient.getAssurance())
                .numeroAssurance(patient.getNumeroAssurance())
                .statut(patient.getStatut())
                .createdAt(patient.getCreatedAt())
                .build();
    }

    private void enrichWithUserInfo(PatientDTO dto, UserDTO userInfo, Long idUser) {
        if (userInfo != null) {
            dto.setNom(userInfo.getNom());
            dto.setPrenom(userInfo.getPrenom());
            dto.setCin(userInfo.getCin());
            dto.setEmail(userInfo.getEmail());
            dto.setSexe(userInfo.getSexe());
            dto.setDateNaissance(userInfo.getDateNaissance() != null ? userInfo.getDateNaissance().toString() : null);
            dto.setTelephone(userInfo.getTelephone());
            dto.setAdresse(userInfo.getAdresse());
            log.debug("Données utilisateur mappées avec succès pour idUser: {}", idUser);
        } else {
            log.warn("Impossible de récupérer les infos de l'utilisateur {} pour le DTO", idUser);
        }
    }

    private String generateNumDossier() {
        String date = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        String random = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return String.format("DOSS-%s-%s", date, random);
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
}
