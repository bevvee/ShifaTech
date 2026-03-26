package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.AuthServiceClient;
import com.shifatech.patient_service.dto.CreateDossierRequest;
import com.shifatech.patient_service.dto.DossierMedicalDTO;
import com.shifatech.patient_service.dto.UpdateDossierRequest;
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

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DossierMedicalService {

    private final DossierMedicalRepository dossierMedicalRepository;
    private final PatientRepository patientRepository;
    private final AuthServiceClient authServiceClient;
    private final JwtUtil jwtUtil;

    // =========================================================================
    // ✅ RÉSOLUTION D'ID ROBUSTE (PK vs idUser)
    // =========================================================================

    private Patient resolvePatient(Long idInput) {
        if (idInput == null) {
            throw new ResourceNotFoundException("Patient", "id", "null");
        }
        return patientRepository.findById(idInput)
                .orElseGet(() -> {
                    log.info("Patient non trouvé par ID PK {}. Tentative par idUser...", idInput);
                    return patientRepository.findByIdUser(idInput)
                            .orElseThrow(() -> new ResourceNotFoundException("Patient", "id/idUser", idInput));
                });
    }

    // =========================================================================
    // ✅ CREATE
    // =========================================================================

    public DossierMedicalDTO createDossier(Long idPatientInput,
                                           CreateDossierRequest request,
                                           Long createdBy,
                                           String authHeader) {

        log.info("Création dossier - ID reçu: {}", idPatientInput);

        // 🔐 Sécurité
        if (!isInfirmier() && !isDocteur() && !isAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seul un infirmier ou un médecin peut créer un dossier médical.");
        }

        // 🔎 Résolution
        Patient patient = resolvePatient(idPatientInput);
        Long actualIdPatient = patient.getIdPatient();

        // ⚠️ Vérifier existence (ACTIVE uniquement)
        boolean exists = dossierMedicalRepository
                .findByIdPatientAndStatus(actualIdPatient, DossierMedical.StatusDossier.ACTIVE)
                .isPresent();

        if (exists) {
            throw new ResourceAlreadyExistsException("DossierMedical", "idPatient", actualIdPatient);
        }

        DossierMedical dossier = new DossierMedical();
        dossier.setIdPatient(actualIdPatient);
        dossier.setPoids(request.getPoids());
        dossier.setTaille(request.getTaille());
        dossier.setGroupeSanguin(request.getGroupeSanguin());
        dossier.setAntecedentsMedicaux(request.getAntecedentsMedicaux());
        dossier.setAllergies(request.getAllergies());
        dossier.setPathologiesChroniques(request.getPathologiesChroniques());
        dossier.setNotes(request.getNotes());
        dossier.setDiagnostic(request.getDiagnostic());
        dossier.setCreatedBy(createdBy);
        dossier.setStatus(DossierMedical.StatusDossier.ACTIVE);

        DossierMedical saved = dossierMedicalRepository.save(dossier);
        log.info("Dossier sauvegardé avec ID: {} pour patient: {}", saved.getIdDossier(), actualIdPatient);

        return mapToDTO(saved, authHeader);
    }

    // =========================================================================
    // ✅ READ (BY PATIENT)
    // =========================================================================

    @Transactional(readOnly = true)
    public DossierMedicalDTO getDossierMedicalByPatient(Long idPatientInput, String authHeader) {
        Patient patient = resolvePatient(idPatientInput);
        Long actualIdPatient = patient.getIdPatient();

        DossierMedical dossier = dossierMedicalRepository.findByIdPatient(actualIdPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier médical", "idPatient", actualIdPatient));

        // 🔐 Vérification d'accès simplifiée
        checkReadAccess(patient);

        return mapToDTO(dossier, authHeader);
    }

    // =========================================================================
    // ✅ READ ALL
    // =========================================================================

    @Transactional(readOnly = true)
    public java.util.List<DossierMedicalDTO> getAllDossiers(String authHeader) {
        if (!isAdmin() && !isDocteur() && !isInfirmier()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seul le personnel médical peut lister les dossiers.");
        }
        return dossierMedicalRepository.findAll().stream()
                .map(d -> mapToDTO(d, authHeader))
                .collect(java.util.stream.Collectors.toList());
    }

    // =========================================================================
    // ✅ UPDATE
    // =========================================================================

    public DossierMedicalDTO updateDossier(Long idPatientInput, UpdateDossierRequest request, Long updatedBy,
                                           String authHeader) {
        if (!isInfirmier() && !isDocteur() && !isAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seul un infirmier ou un médecin peut modifier un dossier médical.");
        }

        Patient patient = resolvePatient(idPatientInput);
        Long actualIdPatient = patient.getIdPatient();

        DossierMedical dossier = dossierMedicalRepository
                .findByIdPatientAndStatus(actualIdPatient, DossierMedical.StatusDossier.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "idPatient", actualIdPatient));

        if (request.getPoids() != null) dossier.setPoids(request.getPoids());
        if (request.getTaille() != null) dossier.setTaille(request.getTaille());
        if (request.getGroupeSanguin() != null) dossier.setGroupeSanguin(request.getGroupeSanguin());
        if (request.getAntecedentsMedicaux() != null) dossier.setAntecedentsMedicaux(request.getAntecedentsMedicaux());
        if (request.getAllergies() != null) dossier.setAllergies(request.getAllergies());
        if (request.getPathologiesChroniques() != null) dossier.setPathologiesChroniques(request.getPathologiesChroniques());
        if (request.getNotes() != null) dossier.setNotes(request.getNotes());
        if (request.getDiagnostic() != null) dossier.setDiagnostic(request.getDiagnostic());
        
        dossier.setUpdatedBy(updatedBy);

        return mapToDTO(dossierMedicalRepository.save(dossier), authHeader);
    }

    // =========================================================================
    // ✅ DELETE
    // =========================================================================

    public void deleteDossier(Long idPatientInput) {
        if (!isInfirmier() && !isAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seul un infirmier ou un administrateur peut supprimer un dossier médical.");
        }

        Patient patient = resolvePatient(idPatientInput);
        Long actualIdPatient = patient.getIdPatient();

        DossierMedical dossier = dossierMedicalRepository.findByIdPatient(actualIdPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier médical", "idPatient", actualIdPatient));
        
        dossier.setStatus(DossierMedical.StatusDossier.ARCHIVED);
        dossierMedicalRepository.save(dossier);
    }

    // =========================================================================
    // 🧾 MAPPING (HORS TRANSACTION - CATCH EXCEPTIONS)
    // =========================================================================

    private DossierMedicalDTO mapToDTO(DossierMedical dossier, String authHeader) {
        DossierMedicalDTO dto = DossierMedicalDTO.builder()
                .idDossier(dossier.getIdDossier())
                .idPatient(dossier.getIdPatient())
                .status(dossier.getStatus())
                .poids(dossier.getPoids())
                .taille(dossier.getTaille())
                .groupeSanguin(dossier.getGroupeSanguin())
                .antecedentsMedicaux(dossier.getAntecedentsMedicaux())
                .allergies(dossier.getAllergies())
                .pathologiesChroniques(dossier.getPathologiesChroniques())
                .notes(dossier.getNotes())
                .diagnostic(dossier.getDiagnostic())
                .dateCreation(dossier.getDateCreation())
                .dateFermeture(dossier.getDateFermeture())
                .build();

        if (dossier.getIdPatient() != null) {
            patientRepository.findById(dossier.getIdPatient()).ifPresent(patient -> {
                dto.setNumDossier(patient.getNumDossier());
                try {
                    if (patient.getIdUser() != null) {
                        var user = authServiceClient.getUserById(patient.getIdUser(), authHeader);
                        if (user != null) {
                            dto.setNomPatient(user.getNom() + " " + user.getPrenom());
                        }
                    }
                } catch (Exception e) {
                    log.warn("Auth Service indisponible pour idUser {}: {}", patient.getIdUser(), e.getMessage());
                }
            });
        }

        return dto;
    }

    private void checkReadAccess(Patient patient) {
        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !isDocteur() && !isInfirmier() &&
                !patient.getIdUser().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé au dossier médical de ce patient.");
        }
    }

    // =========================================================================
    // 🔐 ROLES
    // =========================================================================

    private boolean isAdmin() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isDocteur() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTEUR"));
    }

    private boolean isInfirmier() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_INFIRMIER"));
    }
}