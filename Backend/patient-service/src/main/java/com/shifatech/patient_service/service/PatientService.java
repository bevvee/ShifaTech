package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.AuthServiceClient;
import com.shifatech.patient_service.dto.CreatePatientRequest;
import com.shifatech.patient_service.dto.PatientDTO;
import com.shifatech.patient_service.dto.UpdatePatientRequest;
import com.shifatech.patient_service.dto.UserDTO;
import com.shifatech.patient_service.entity.Patient;
import com.shifatech.patient_service.exception.ResourceAlreadyExistsException;
import com.shifatech.patient_service.exception.ResourceNotFoundException;
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
    private final AuthServiceClient authServiceClient;
    private final JwtUtil jwtUtil;

    public PatientDTO createPatient(CreatePatientRequest request, Long createdBy, String authHeader) {
        log.info("Création d'un nouveau patient pour l'utilisateur ID: {}", request.getIdUser());

        /*
         * if (!isMedicalStaff() && !request.getIdUser().equals(createdBy)) {
         * throw new org.springframework.security.access.AccessDeniedException(
         * "Seul le personnel médical ou l'utilisateur lui-même peut créer ce profil.");
         * }
         */

        if (patientRepository.existsByIdUser(request.getIdUser())) {
            throw new ResourceAlreadyExistsException("Patient", "idUser", request.getIdUser());
        }

        Patient patient = new Patient();
        patient.setIdUser(request.getIdUser());
        patient.setNumDossier(generateNumDossier());
        patient.setAssurance(request.getAssurance());
        patient.setNumeroAssurance(request.getNumeroAssurance());
        patient.setStatut(true);
        patient.setCreatedBy(createdBy);

        Patient savedPatient = patientRepository.save(patient);
        log.info("Patient créé avec succès. ID: {}, NumDossier: {}", savedPatient.getIdPatient(),
                savedPatient.getNumDossier());

        return mapToDTO(savedPatient, authHeader);
    }

    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long id, String authHeader) {
        log.info("Récupération du patient ID: {}", id);
        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        // Sécurité : Vérifier que c'est le patient lui-même ou un admin
        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !patient.getIdUser().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé au dossier de ce patient.");
        }

        return mapToDTO(patient, authHeader);
    }

    @Transactional(readOnly = true)
    public PatientDTO getPatientByUserId(Long userId, String authHeader) {
        log.info("Récupération du patient par User ID: {}", userId);

        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !userId.equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé au profil de cet utilisateur.");
        }

        Patient patient = patientRepository.findByIdUser(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "idUser", userId));
        return mapToDTO(patient, authHeader);
    }

    @Transactional(readOnly = true)
    public List<PatientDTO> getAllPatients(String authHeader) {
        if (!isAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Seuls les administrateurs peuvent lister tous les patients.");
        }
        log.info("Récupération de tous les patients actifs (Admin)");
        return patientRepository.findAllActive().stream()
                .map(p -> mapToDTO(p, authHeader))
                .collect(Collectors.toList());
    }

    public PatientDTO updatePatient(Long id, UpdatePatientRequest request, Long updatedBy, String authHeader) {
        log.info("Mise à jour du patient ID: {}", id);

        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        /*
         * if (!isMedicalStaff() && !patient.getIdUser().equals(updatedBy)) {
         * throw new org.springframework.security.access.AccessDeniedException(
         * "Vous ne pouvez modifier que votre propre dossier patient (sauf si vous êtes médecin/infirmier)."
         * );
         * }
         */

        if (request.getAssurance() != null)
            patient.setAssurance(request.getAssurance());
        if (request.getNumeroAssurance() != null)
            patient.setNumeroAssurance(request.getNumeroAssurance());
        if (request.getStatut() != null)
            patient.setStatut(request.getStatut());

        patient.setUpdatedBy(updatedBy);

        Patient updatedPatient = patientRepository.save(patient);
        log.info("Patient mis à jour avec succès. ID: {}", updatedPatient.getIdPatient());

        return mapToDTO(updatedPatient, authHeader);
    }

    public void deletePatient(Long id, Long deletedBy) {
        log.info("Suppression (soft delete) du patient ID: {}", id);

        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        if (!isAdmin() && !patient.getIdUser().equals(deletedBy)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Vous ne pouvez supprimer que votre propre dossier patient.");
        }

        patient.setDeletedAt(LocalDateTime.now());
        patient.setDeletedBy(deletedBy);
        patient.setStatut(false);

        patientRepository.save(patient);
        log.info("Patient supprimé avec succès. ID: {}", id);
    }

    private PatientDTO mapToDTO(Patient patient, String authHeader) {
        PatientDTO dto = PatientDTO.builder()
                .idPatient(patient.getIdPatient())
                .idUser(patient.getIdUser())
                .numDossier(patient.getNumDossier())
                .assurance(patient.getAssurance())
                .numeroAssurance(patient.getNumeroAssurance())
                .statut(patient.getStatut())
                .createdAt(patient.getCreatedAt())
                .build();

        if (authHeader != null && patient.getIdUser() != null) {
            Long tokenUserId = jwtUtil.getUserIdFromToken();
            if (tokenUserId != null && tokenUserId.equals(patient.getIdUser())) {
                try {
                    UserDTO userInfo = authServiceClient.getProfileWithToken(authHeader);
                    dto.setUserInfo(userInfo);
                } catch (Exception e) {
                    log.warn("Impossible de récupérer les infos utilisateur depuis Auth Service", e);
                }
            }
        }

        return dto;
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

    private boolean isMedicalStaff() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null)
            return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                        a.getAuthority().equals("ROLE_DOCTEUR") ||
                        a.getAuthority().equals("ROLE_INFIRMIER"));
    }
}
