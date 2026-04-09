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

    // =========================================================================
    // ✅ RÉSOLUTION D'ID ROBUSTE (PK vs idUser)
    // =========================================================================

    private Patient resolvePatient(Long idInput) {
        if (idInput == null) return null;
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

    public OrdonnanceDTO createOrdonnance(CreateOrdonnanceRequest request, Long createdBy, String authHeader) {
        if (!isDocteur() && !isAdmin()) {
            throw new AccessDeniedException("Seul un médecin ou un administrateur peut créer une ordonnance.");
        }
        
        log.info("Création d'une ordonnance - ID reçu: {}", request.getIdPatient());
        
        Patient patient = resolvePatient(request.getIdPatient());
        Long actualIdPatient = patient.getIdPatient();

        Ordonnance ordonnance = new Ordonnance();
        ordonnance.setIdPatient(actualIdPatient);
        ordonnance.setIdDoctor(request.getIdDoctor());
        ordonnance.setIdVisite(request.getIdVisite());
        ordonnance.setMedicaments(request.getMedicaments());
        ordonnance.setDescription(request.getDescription());
        ordonnance.setPosologie(request.getPosologie());
        ordonnance.setDureeTraitement(request.getDureeTraitement());
        ordonnance.setInstructions(request.getInstructions());
        ordonnance.setDateValidite(request.getDateValidite());
        ordonnance.setCreatedBy(createdBy);
        ordonnance.setStatut(com.shifatech.patient_service.entity.StatusOrdonnance.ACTIVE);

        Ordonnance saved = ordonnanceRepository.save(ordonnance);
        log.info("Ordonnance sauvegardée avec ID: {} pour patient: {}", saved.getIdOrdonnance(), actualIdPatient);
        
        return mapToDTO(saved, authHeader);
    }

    // =========================================================================
    // ✅ READ (BY PATIENT)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<OrdonnanceDTO> getOrdonnancesByPatientId(Long idPatientInput, String authHeader) {
        log.info("[DIAGNOSTIC] Récupération des ordonnances pour le patient IDInput: {}", idPatientInput);

        Patient patient = resolvePatient(idPatientInput);
        Long actualIdPatient = patient.getIdPatient();
        log.info("[DIAGNOSTIC] Patient résolu ID: {}", actualIdPatient);

        checkReadAccess(patient);

        List<Ordonnance> list = ordonnanceRepository.findByIdPatient(actualIdPatient);
        log.info("[DIAGNOSTIC] Trouvé {} ordonnances en base pour le patient {}", list.size(), actualIdPatient);

        return list.stream()
                .map(o -> mapToDTO(o, authHeader))
                .collect(Collectors.toList());
    }

    // =========================================================================
    // ✅ READ ONE
    // =========================================================================

    @Transactional(readOnly = true)
    public OrdonnanceDTO getOrdonnanceById(Long id, String authHeader) {
        log.info("Récupération de l'ordonnance ID: {}", id);
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance", "id", id));

        Patient patient = patientRepository.findById(ordonnance.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", ordonnance.getIdPatient()));

        checkReadAccess(patient);

        return mapToDTO(ordonnance, authHeader);
    }

    // =========================================================================
    // ✅ READ ALL
    // =========================================================================

    @Transactional(readOnly = true)
    public List<OrdonnanceDTO> getAllOrdonnances(String authHeader) {
        // Harmonisation avec le contrôleur : Autoriser INFIRMIER
        if (!isAdmin() && !isDocteur() && !isInfirmier()) {
            throw new AccessDeniedException("Accès refusé à la liste globale des ordonnances.");
        }
        log.info("Récupération de toutes les ordonnances");
        return ordonnanceRepository.findAll().stream()
                .map(o -> mapToDTO(o, authHeader))
                .collect(Collectors.toList());
    }

    // =========================================================================
    // ✅ UPDATE
    // =========================================================================

    public OrdonnanceDTO updateOrdonnance(Long id, CreateOrdonnanceRequest request, String authHeader) {
        if (!isDocteur() && !isAdmin()) {
            throw new AccessDeniedException("Seul un médecin ou un administrateur peut modifier une ordonnance.");
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
        
        if (request.getStatut() != null) {
            ordonnance.setStatut(request.getStatut());
        }

        return mapToDTO(ordonnanceRepository.save(ordonnance), authHeader);
    }

    // =========================================================================
    // ✅ DELETE
    // =========================================================================

    public void deleteOrdonnance(Long id) {
        if (!isDocteur() && !isAdmin()) {
            throw new AccessDeniedException("Seul un médecin ou un administrateur peut supprimer une ordonnance.");
        }
        log.info("Suppression de l'ordonnance ID: {}", id);
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance", "id", id));
        
        ordonnance.setStatut(com.shifatech.patient_service.entity.StatusOrdonnance.CANCELLED); // Suppression logique
        ordonnanceRepository.save(ordonnance);
    }

    // =========================================================================
    // 🔐 SÉCURITÉ & ROLES
    // =========================================================================

    private void checkReadAccess(Patient patient) {
        Long currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId != null && !isAdmin() && !isDocteur() && !isInfirmier() &&
                !patient.getIdUser().equals(currentUserId)) {
            throw new AccessDeniedException("Accès refusé aux ordonnances de ce patient.");
        }
    }

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

    // =========================================================================
    // 🧾 MAPPING (SÉCURISÉ)
    // =========================================================================

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

        if (ordonnance.getIdPatient() != null) {
            patientRepository.findById(ordonnance.getIdPatient()).ifPresent(patient -> {
                dto.setNumDossier(patient.getNumDossier());
                if (patient.getIdUser() != null) {
                    try {
                        var user = authServiceClient.getUserById(patient.getIdUser(), authHeader);
                        if (user != null) {
                            dto.setNomPatient(user.getNom() + " " + user.getPrenom());
                        }
                    } catch (Exception e) {
                        log.warn("Erreur AuthServiceClient pour ordonnance {}: {}", ordonnance.getIdOrdonnance(), e.getMessage());
                    }
                }
            });
        }
        return dto;
    }
}
