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
@Transactional
@Slf4j
public class DossierMedicalService {

    private final DossierMedicalRepository dossierMedicalRepository;
    private final PatientRepository patientRepository;
    private final AuthServiceClient authServiceClient;
    private final JwtUtil jwtUtil;

    /**
     * Récupérer le dossier médical d'un patient
     */
    public DossierMedicalDTO getDossierMedicalByPatient(Long idPatient) {
        log.info("Récupération du dossier médical pour le patient: {}", idPatient);

        DossierMedical dossier = dossierMedicalRepository.findByIdPatient(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier médical", "idPatient", idPatient));

        checkReadAccess(idPatient);

        return mapToDTO(dossier);
    }

    public boolean hasDossierMedical(Long idPatient) {
        return dossierMedicalRepository.existsByIdPatient(idPatient);
    }

    @Transactional(readOnly = true)
    public java.util.List<DossierMedicalDTO> getAllDossiers() {
        if (!isAdmin() && !isDocteur() && !isInfirmier()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seul le personnel médical peut lister les dossiers.");
        }
        log.info("Récupération de tous les dossiers médicaux");
        return dossierMedicalRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public DossierMedicalDTO createDossier(Long idPatient, CreateDossierRequest request, Long createdBy) {
        log.info("Création du dossier médical pour le patient ID: {}", idPatient);

        Patient patient = patientRepository.findById(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", idPatient));

        /*
         * if (!isAdmin() && !patient.getIdUser().equals(createdBy)) {
         * throw new
         * AccessDeniedException("Seul un administrateur ou le patient lui-même peut créer ce dossier."
         * );
         * }
         */

        if (dossierMedicalRepository.existsByIdPatient(idPatient)) {
            throw new ResourceAlreadyExistsException("DossierMedical", "idPatient", idPatient);
        }

        DossierMedical dossier = new DossierMedical();
        dossier.setIdPatient(idPatient);
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

        DossierMedical savedDossier = dossierMedicalRepository.save(dossier);
        return mapToDTO(savedDossier);
    }

    public DossierMedicalDTO updateDossier(Long idPatient, UpdateDossierRequest request, Long updatedBy) {
        log.info("Mise à jour du dossier médical pour le patient ID: {}", idPatient);

        /*
         * if (!isAdmin()) {
         * throw new
         * AccessDeniedException("Accès refusé. Seul un administrateur peut modifier le dossier médical."
         * );
         * }
         */

        DossierMedical dossier = dossierMedicalRepository
                .findByIdPatientAndStatus(idPatient, DossierMedical.StatusDossier.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "idPatient", idPatient));

        if (request.getPoids() != null)
            dossier.setPoids(request.getPoids());
        if (request.getTaille() != null)
            dossier.setTaille(request.getTaille());
        if (request.getGroupeSanguin() != null)
            dossier.setGroupeSanguin(request.getGroupeSanguin());
        if (request.getAntecedentsMedicaux() != null)
            dossier.setAntecedentsMedicaux(request.getAntecedentsMedicaux());
        if (request.getAllergies() != null)
            dossier.setAllergies(request.getAllergies());
        if (request.getPathologiesChroniques() != null)
            dossier.setPathologiesChroniques(request.getPathologiesChroniques());
        if (request.getNotes() != null)
            dossier.setNotes(request.getNotes());
        if (request.getDiagnostic() != null)
            dossier.setDiagnostic(request.getDiagnostic());
        dossier.setUpdatedBy(updatedBy);

        DossierMedical updatedDossier = dossierMedicalRepository.save(dossier);
        return mapToDTO(updatedDossier);
    }

    public void deleteDossier(Long idPatient) {
        if (!isAdmin() && !isInfirmier()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seuls les infirmiers ou administrateurs peuvent supprimer un dossier.");
        }
        log.info("Suppression du dossier médical pour le patient ID: {}", idPatient);
        DossierMedical dossier = dossierMedicalRepository.findByIdPatient(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier médical", "idPatient", idPatient));
        dossier.setStatus(DossierMedical.StatusDossier.ARCHIVED);
        dossierMedicalRepository.save(dossier);
    }

    private void checkReadAccess(Long idPatient) {
        Long currentUserId = jwtUtil.getUserIdFromToken();
        Patient patient = patientRepository.findById(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", idPatient));

        if (currentUserId != null && !isAdmin() && !isDocteur() && !patient.getIdUser().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé au dossier médical de ce patient.");
        }
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

    private DossierMedicalDTO mapToDTO(DossierMedical dossier) {
        return DossierMedicalDTO.builder()
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
                .dateFermeture(dossier.getDateFermeture())
                .dateCreation(dossier.getDateCreation())
                .build();
    }
}
