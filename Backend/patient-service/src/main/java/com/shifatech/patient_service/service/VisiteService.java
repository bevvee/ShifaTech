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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

        public VisiteDTO createVisite(CreateVisiteRequest request, Long createdBy, String authHeader) {
                log.info("Création d'une visite pour le dossier ID: {}", request.getIdDossier());

                // Seuls les médecins ou admins peuvent créer des visites
                DossierMedical dossier = dossierMedicalRepository.findById(request.getIdDossier())
                                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "id",
                                                request.getIdDossier()));

                Patient patient = patientRepository.findById(dossier.getIdPatient())
                                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id",
                                                dossier.getIdPatient()));

                // Seuls les médecins ou admins peuvent créer des visites
                // Exception pour le patient lui-même (Pour Testing)
                /*
                 * if (!hasWriteAccess() && !patient.getIdUser().equals(createdBy)) {
                 * throw new
                 * AccessDeniedException("Seul un médecin ou un administrateur peut créer une visite."
                 * );
                 * }
                 */

                Visite visite = new Visite();
                visite.setIdDoctor(request.getIdDoctor());
                visite.setIdDossier(request.getIdDossier());
                visite.setPlanTraitement(request.getPlanTraitement());
                visite.setObservations(request.getObservations());
                visite.setCreatedBy(createdBy);
                visite.setStatus(Visite.StatusVisite.OPEN);

                Visite savedVisite = visiteRepository.save(visite);
                return mapToDTO(savedVisite, authHeader);
        }

        @Transactional(readOnly = true)
        public List<VisiteDTO> getVisitesByDossierId(Long idDossier, String authHeader) {
                log.info("Récupération des visites pour le dossier ID: {}", idDossier);

                DossierMedical dossier = dossierMedicalRepository.findById(idDossier)
                                .orElseThrow(() -> new ResourceNotFoundException("DossierMedical", "id", idDossier));

                Patient patient = patientRepository.findById(dossier.getIdPatient())
                                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id",
                                                dossier.getIdPatient()));

                checkReadAccess(patient);

                return visiteRepository.findByIdDossier(idDossier).stream()
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
                if (!isAdmin() && !isDocteur() && !isInfirmier()) {
                        throw new AccessDeniedException("Seul le personnel médical peut lister les visites.");
                }
                log.info("Récupération de toutes les visites");
                return visiteRepository.findAll().stream()
                                .map(v -> mapToDTO(v, authHeader))
                                .collect(Collectors.toList());
        }

        public VisiteDTO updateVisite(Long id, CreateVisiteRequest request, String authHeader) {
                if (!isInfirmier()) {
                        throw new AccessDeniedException("Seul un infirmier peut modifier une visite.");
                }
                log.info("Mise à jour de la visite ID: {}", id);
                Visite visite = visiteRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Visite", "id", id));

                visite.setPlanTraitement(request.getPlanTraitement());
                visite.setObservations(request.getObservations());

                return mapToDTO(visiteRepository.save(visite), authHeader);
        }

        public void deleteVisite(Long id) {
                if (!isAdmin() && !isInfirmier()) {
                        throw new AccessDeniedException(
                                        "Seuls les infirmiers ou administrateurs peuvent supprimer une visite.");
                }
                log.info("Suppression de la visite ID: {}", id);
                Visite visite = visiteRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Visite", "id", id));
                visite.setStatus(Visite.StatusVisite.CLOSED);
                visiteRepository.save(visite);
        }

        private void checkReadAccess(Patient patient) {
                Long currentUserId = jwtUtil.getUserIdFromToken();
                if (currentUserId != null && !isAdmin() && !isDocteur() && !isInfirmier()
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

        private VisiteDTO mapToDTO(Visite visite, String authHeader) {
                VisiteDTO dto = VisiteDTO.builder()
                                .idVisite(visite.getIdVisite())
                                .idDoctor(visite.getIdDoctor())
                                .idDossier(visite.getIdDossier())
                                .status(visite.getStatus())
                                .dateCreation(visite.getDateCreation())
                                .planTraitement(visite.getPlanTraitement())
                                .observations(visite.getObservations())
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
}
