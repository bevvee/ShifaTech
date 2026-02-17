package com.shifatech.patient_service.service;

import com.shifatech.patient_service.dto.DossierMedicalDTO;
import com.shifatech.patient_service.entity.DossierMedical;
import com.shifatech.patient_service.entity.Patient;
import com.shifatech.patient_service.exception.ResourceAlreadyExistsException;
import com.shifatech.patient_service.exception.ResourceNotFoundException;
import com.shifatech.patient_service.repository.DossierMedicalRepository;
import com.shifatech.patient_service.repository.PatientRepository;
import com.shifatech.patient_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DossierMedicalService {

    private final DossierMedicalRepository dossierMedicalRepository;
    private final PatientRepository patientRepository;
    private final JwtUtil jwtUtil;

    public DossierMedicalDTO getDossierByPatientId(Long idPatient) {
        log.info("Récupération du dossier médical pour le patient ID: {}", idPatient);

        // Vérifier l'existence du patient
        Patient patient = patientRepository.findById(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", idPatient));

        // Sécurité : Vérifier l'accès
        checkAccess(patient);

        DossierMedical dossier = dossierMedicalRepository
                .findByIdPatientAndStatus(idPatient, DossierMedical.StatusDossier.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "idPatient", idPatient));

        return mapToDTO(dossier);
    }

    public DossierMedicalDTO createDossier(Long idPatient, String notes, String diagnostic, Long createdBy) {
        log.info("Création du dossier médical pour le patient ID: {}", idPatient);

        // Seuls les admins ou médecins (via internal API) devraient créer des dossiers
        // ?
        // Ou création automatique à la création du patient ?
        // Pour l'instant, disons Admin seulement.
        Patient patient = patientRepository.findById(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", idPatient));

        // Permettre la création si Admin OU si c'est le patient lui-même
        if (!isAdmin() && !patient.getIdUser().equals(createdBy)) {
            throw new AccessDeniedException("Seul un administrateur ou le patient lui-même peut créer ce dossier.");
        }

        if (dossierMedicalRepository.existsByIdPatient(idPatient)) {
            throw new ResourceAlreadyExistsException("DossierMedical", "idPatient", idPatient);
        }

        DossierMedical dossier = new DossierMedical();
        dossier.setIdPatient(idPatient);
        dossier.setNotes(notes);
        dossier.setDiagnostic(diagnostic);
        dossier.setCreatedBy(createdBy);
        dossier.setStatus(DossierMedical.StatusDossier.ACTIVE);

        DossierMedical savedDossier = dossierMedicalRepository.save(dossier);
        return mapToDTO(savedDossier);
    }

    // Mettre à jour le dossier (Notes, Diagnostic)
    public DossierMedicalDTO updateDossier(Long idPatient, String notes, String diagnostic, Long updatedBy) {
        log.info("Mise à jour du dossier médical pour le patient ID: {}", idPatient);

        // Seuls les admins peuvent modifier pour l'instant (ou via internal service
        // API)
        if (!isAdmin()) {
            throw new AccessDeniedException("Accès refusé. Seul un administrateur peut modifier le dossier médical.");
        }

        DossierMedical dossier = dossierMedicalRepository
                .findByIdPatientAndStatus(idPatient, DossierMedical.StatusDossier.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "idPatient", idPatient));

        if (notes != null)
            dossier.setNotes(notes);
        if (diagnostic != null)
            dossier.setDiagnostic(diagnostic);
        dossier.setUpdatedBy(updatedBy);

        DossierMedical updatedDossier = dossierMedicalRepository.save(dossier);
        return mapToDTO(updatedDossier);
    }

    private void checkAccess(Patient patient) {
        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !patient.getIdUser().equals(currentUserId)) {
            throw new AccessDeniedException("Accès refusé au dossier médical de ce patient.");
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

    private DossierMedicalDTO mapToDTO(DossierMedical dossier) {
        return DossierMedicalDTO.builder()
                .idDossier(dossier.getIdDossier())
                .idPatient(dossier.getIdPatient())
                .status(dossier.getStatus())
                .notes(dossier.getNotes())
                .diagnostic(dossier.getDiagnostic())
                .dateFermeture(dossier.getDateFermeture())
                .dateCreation(dossier.getDateCreation())
                .build();
    }
}
