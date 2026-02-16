package com.shifatech.patient_service.service;

import com.shifatech.patient_service.dto.CreatePatientRequest;
import com.shifatech.patient_service.dto.PatientDTO;
import com.shifatech.patient_service.dto.UpdatePatientRequest;
import com.shifatech.patient_service.dto.UserDTO;
import com.shifatech.patient_service.entity.Patient;
import com.shifatech.patient_service.exception.ResourceAlreadyExistsException;
import com.shifatech.patient_service.exception.ResourceNotFoundException;
import com.shifatech.patient_service.repository.PatientRepository;
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
    // TODO: Inject AuthServiceClient when ready
    // private final AuthServiceClient authServiceClient;

    public PatientDTO createPatient(CreatePatientRequest request, Long createdBy) {
        log.info("Création d'un nouveau patient pour l'utilisateur ID: {}", request.getIdUser());

        // Vérifier si un patient existe déjà pour cet utilisateur
        if (patientRepository.existsByIdUser(request.getIdUser())) {
            throw new ResourceAlreadyExistsException("Patient", "idUser", request.getIdUser());
        }

        // Créer le patient
        Patient patient = new Patient();
        patient.setIdUser(request.getIdUser());
        patient.setNumDossier(generateNumDossier());
        patient.setPoids(request.getPoids());
        patient.setTaille(request.getTaille());
        patient.setGroupeSanguin(request.getGroupeSanguin());
        patient.setAntecedentsMedicaux(request.getAntecedentsMedicaux());
        patient.setAllergies(request.getAllergies());
        patient.setPathologiesChroniques(request.getPathologiesChroniques());
        patient.setAssurance(request.getAssurance());
        patient.setNumeroAssurance(request.getNumeroAssurance());
        patient.setContactUrgenceNom(request.getContactUrgenceNom());
        patient.setContactUrgenceTel(request.getContactUrgenceTel());
        patient.setStatut(true);
        patient.setCreatedBy(createdBy);

        Patient savedPatient = patientRepository.save(patient);
        log.info("Patient créé avec succès. ID: {}, NumDossier: {}", savedPatient.getIdPatient(), savedPatient.getNumDossier());

        return mapToDTO(savedPatient);
    }

    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long id) {
        log.info("Récupération du patient ID: {}", id);
        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return mapToDTO(patient);
    }

    @Transactional(readOnly = true)
    public PatientDTO getPatientByUserId(Long userId) {
        log.info("Récupération du patient par User ID: {}", userId);
        Patient patient = patientRepository.findByIdUser(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "idUser", userId));
        return mapToDTO(patient);
    }

    @Transactional(readOnly = true)
    public List<PatientDTO> getAllPatients() {
        log.info("Récupération de tous les patients actifs");
        return patientRepository.findAllActive().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO updatePatient(Long id, UpdatePatientRequest request, Long updatedBy) {
        log.info("Mise à jour du patient ID: {}", id);

        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        // Mise à jour des champs
        if (request.getPoids() != null) patient.setPoids(request.getPoids());
        if (request.getTaille() != null) patient.setTaille(request.getTaille());
        if (request.getGroupeSanguin() != null) patient.setGroupeSanguin(request.getGroupeSanguin());
        if (request.getAntecedentsMedicaux() != null) patient.setAntecedentsMedicaux(request.getAntecedentsMedicaux());
        if (request.getAllergies() != null) patient.setAllergies(request.getAllergies());
        if (request.getPathologiesChroniques() != null) patient.setPathologiesChroniques(request.getPathologiesChroniques());
        if (request.getAssurance() != null) patient.setAssurance(request.getAssurance());
        if (request.getNumeroAssurance() != null) patient.setNumeroAssurance(request.getNumeroAssurance());
        if (request.getContactUrgenceNom() != null) patient.setContactUrgenceNom(request.getContactUrgenceNom());
        if (request.getContactUrgenceTel() != null) patient.setContactUrgenceTel(request.getContactUrgenceTel());
        if (request.getStatut() != null) patient.setStatut(request.getStatut());

        patient.setUpdatedBy(updatedBy);

        Patient updatedPatient = patientRepository.save(patient);
        log.info("Patient mis à jour avec succès. ID: {}", updatedPatient.getIdPatient());

        return mapToDTO(updatedPatient);
    }

    public void deletePatient(Long id, Long deletedBy) {
        log.info("Suppression (soft delete) du patient ID: {}", id);

        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        // Soft delete
        patient.setDeletedAt(LocalDateTime.now());
        patient.setDeletedBy(deletedBy);
        patient.setStatut(false);

        patientRepository.save(patient);
        log.info("Patient supprimé avec succès. ID: {}", id);
    }

    private PatientDTO mapToDTO(Patient patient) {
        PatientDTO dto = PatientDTO.builder()
                .idPatient(patient.getIdPatient())
                .idUser(patient.getIdUser())
                .numDossier(patient.getNumDossier())
                .poids(patient.getPoids())
                .taille(patient.getTaille())
                .groupeSanguin(patient.getGroupeSanguin())
                .antecedentsMedicaux(patient.getAntecedentsMedicaux())
                .allergies(patient.getAllergies())
                .pathologiesChroniques(patient.getPathologiesChroniques())
                .assurance(patient.getAssurance())
                .numeroAssurance(patient.getNumeroAssurance())
                .contactUrgenceNom(patient.getContactUrgenceNom())
                .contactUrgenceTel(patient.getContactUrgenceTel())
                .statut(patient.getStatut())
                .createdAt(patient.getCreatedAt())
                .build();

        // TODO: Récupérer les infos user du service Auth
        // UserDTO userInfo = authServiceClient.getUserById(patient.getIdUser());
        // dto.setUserInfo(userInfo);

        return dto;
    }

    private String generateNumDossier() {
        // Format: DOSS-YYYYMMDD-XXXX (ex: DOSS-20260214-A3F9)
        String date = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        String random = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return String.format("DOSS-%s-%s", date, random);
    }
}