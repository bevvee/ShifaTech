package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.AuthServiceClient;
import com.shifatech.patient_service.dto.CreateOrdonnanceRequest;
import com.shifatech.patient_service.dto.OrdonnanceDTO;
import com.shifatech.patient_service.entity.Ordonnance;
import com.shifatech.patient_service.entity.Patient;
import com.shifatech.patient_service.exception.ResourceNotFoundException;
import com.shifatech.patient_service.repository.OrdonnanceRepository;
import com.shifatech.patient_service.repository.PatientRepository;
import com.shifatech.patient_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrdonnanceService {

    private final OrdonnanceRepository ordonnanceRepository;
    private final PatientRepository patientRepository;
    private final AuthServiceClient authServiceClient;
    private final JwtUtil jwtUtil;

    public OrdonnanceDTO createOrdonnance(CreateOrdonnanceRequest request, Long createdBy, String authHeader) {
        log.info("Création d'une ordonnance pour le patient ID: {}", request.getIdPatient());

        // Seuls les médecins ou admins peuvent créer des ordonnances
        // On suppose que le rôle est vérifié via l'annotation ou ici
        // if (!patientRepository.existsById(request.getIdPatient())) {
        //     throw new ResourceNotFoundException("Patient", "id", request.getIdPatient());
        // }
        // if (!patientRepository.existsById(request.getIdPatient())) {
        //     throw new ResourceNotFoundException("Patient", "id", request.getIdPatient());
        // }
        if (request.getIdPatient() == null || !patientRepository.existsById((Long) request.getIdPatient())) {
            throw new ResourceNotFoundException("Patient", "id", request.getIdPatient());
        }

        // Seuls les médecins ou admins peuvent créer des ordonnances
        // Exception pour le patient lui-même (Pour Testing)
        /*
         * if (!hasWriteAccess() && !patient.getIdUser().equals(createdBy)) {
         * throw new
         * AccessDeniedException("Seul un médecin ou un administrateur peut créer une ordonnance."
         * );
         * }
         */

        Ordonnance ordonnance = new Ordonnance();
        ordonnance.setIdPatient(request.getIdPatient());
        ordonnance.setIdDoctor(request.getIdDoctor());
        ordonnance.setIdVisite(request.getIdVisite());
        ordonnance.setMedicaments(request.getMedicaments()); // JSON ou Text
        ordonnance.setDescription(request.getDescription());
        ordonnance.setPosologie(request.getPosologie());
        ordonnance.setDureeTraitement(request.getDureeTraitement());
        ordonnance.setInstructions(request.getInstructions());
        ordonnance.setDateValidite(request.getDateValidite());
        ordonnance.setCreatedBy(createdBy);
        ordonnance.setStatut(true);

        Ordonnance savedOrdonnance = ordonnanceRepository.save(ordonnance);
        return mapToDTO(savedOrdonnance, authHeader);
    }

    @Transactional(readOnly = true)
    public List<OrdonnanceDTO> getOrdonnancesByPatientId(Long idPatient, String authHeader) {
        log.info("Récupération des ordonnances pour le patient ID: {}", idPatient);

        // Patient patient = patientRepository.findById(idPatient)
        //         .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", idPatient));
        Patient patient = patientRepository.findById((Long) idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", idPatient));

        checkReadAccess(patient);

        return ordonnanceRepository.findByIdPatient(idPatient).stream()
                .map(o -> mapToDTO(o, authHeader))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrdonnanceDTO getOrdonnanceById(Long id, String authHeader) {
        log.info("Récupération de l'ordonnance ID: {}", id);
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance", "id", id));

        // Patient patient = patientRepository.findById(ordonnance.getIdPatient())
        //         .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", ordonnance.getIdPatient()));
        Patient patient = patientRepository.findById((Long) ordonnance.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", ordonnance.getIdPatient()));

        checkReadAccess(patient);

        return mapToDTO(ordonnance, authHeader);
    }

    @Transactional(readOnly = true)
    public List<OrdonnanceDTO> getAllOrdonnances(String authHeader) {
        if (!isAdmin() && !isDocteur()) {
            throw new AccessDeniedException("Seul un médecin ou un administrateur peut lister les ordonnances.");
        }
        log.info("Récupération de toutes les ordonnances");
        return ordonnanceRepository.findAll().stream()
                .map(o -> mapToDTO(o, authHeader))
                .collect(Collectors.toList());
    }

    public OrdonnanceDTO updateOrdonnance(Long id, CreateOrdonnanceRequest request, String authHeader) {
        if (!isDocteur()) {
            throw new AccessDeniedException("Seul un médecin peut modifier une ordonnance.");
        }
        log.info("Mise à jour de l'ordonnance ID: {}", id);
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance", "id", id));

        ordonnance.setMedicaments(request.getMedicaments());
        ordonnance.setDescription(request.getDescription());
        ordonnance.setPosologie(request.getPosologie());
        ordonnance.setDureeTraitement(request.getDureeTraitement());
        ordonnance.setInstructions(request.getInstructions());
        ordonnance.setDateValidite(request.getDateValidite());

        return mapToDTO(ordonnanceRepository.save(ordonnance), authHeader);
    }

    public void deleteOrdonnance(Long id) {
        if (!isDocteur()) {
            throw new AccessDeniedException("Seul un médecin peut supprimer une ordonnance.");
        }
        log.info("Suppression de l'ordonnance ID: {}", id);
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance", "id", id));
        ordonnance.setStatut(false);
        ordonnanceRepository.save(ordonnance);
    }

    private void checkReadAccess(Patient patient) {
        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !isDocteur() && !patient.getIdUser().equals(currentUserId)) {
            throw new AccessDeniedException("Accès refusé aux ordonnances de ce patient.");
        }
    }

    private boolean hasWriteAccess() {
        return isAdmin() || isDocteur();
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

    private OrdonnanceDTO mapToDTO(Ordonnance ordonnance, String authHeader) {
        OrdonnanceDTO dto = OrdonnanceDTO.builder()
                .idOrdonnance(ordonnance.getIdOrdonnance())
                .idPatient(ordonnance.getIdPatient())
                .idDoctor(ordonnance.getIdDoctor())
                .idVisite(ordonnance.getIdVisite())
                .dateCreation(ordonnance.getDateCreation())
                .description(ordonnance.getDescription())
                .medicaments(ordonnance.getMedicaments())
                .posologie(ordonnance.getPosologie())
                .dureeTraitement(ordonnance.getDureeTraitement())
                .instructions(ordonnance.getInstructions())
                .dateValidite(ordonnance.getDateValidite())
                .statut(ordonnance.getStatut())
                .build();

        // Récupérer les infos du patient
        // patientRepository.findById(ordonnance.getIdPatient()).ifPresent(patient -> {
        if (ordonnance.getIdPatient() != null) {
            patientRepository.findById((Long) ordonnance.getIdPatient()).ifPresent(patient -> {
                dto.setNumDossier(patient.getNumDossier());
                if (patient.getIdUser() != null) {
                    try {
                        var user = authServiceClient.getUserById(patient.getIdUser(), authHeader);
                        if (user != null) {
                            dto.setNomPatient(user.getNom() + " " + user.getPrenom());
                        }
                    } catch (Exception e) {
                        log.warn("Erreur récupération patient pour ordonnance: {}", e.getMessage());
                    }
                }
            });
        }

        return dto;
    }
}
