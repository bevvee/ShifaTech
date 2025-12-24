package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.AuthServiceClient;
import com.shifatech.patient_service.dto.DossierMedicalDTO;
import com.shifatech.patient_service.dto.UserDTO;
import com.shifatech.patient_service.entity.DossierMedical;
import com.shifatech.patient_service.repository.DossierMedicalRepository;
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
    private final AuthServiceClient authServiceClient;

    /**
     * Récupérer le dossier médical d'un patient
     */
    public DossierMedicalDTO getDossierMedicalByPatient(Long idPatient) {
        log.info("Récupération du dossier médical pour le patient: {}", idPatient);

        DossierMedical dossier = dossierMedicalRepository.findByIdPatient(idPatient)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé pour le patient: " + idPatient));

        return convertToDTO(dossier);
    }

    /**
     * Vérifier si un patient a un dossier médical
     */
    public boolean hasDossierMedical(Long idPatient) {
        return dossierMedicalRepository.existsByIdPatient(idPatient);
    }

    /**
     * Conversion DossierMedical -> DTO
     */
    private DossierMedicalDTO convertToDTO(DossierMedical dossier) {
        DossierMedicalDTO dto = new DossierMedicalDTO();
        dto.setIdDossier(dossier.getIdDossier());
        dto.setIdPatient(dossier.getIdPatient());
        dto.setIdDocteur(dossier.getIdDocteur());
        dto.setDateCreation(dossier.getDateCreation());
        dto.setDateFermeture(dossier.getDateFermeture());
        dto.setNotes(dossier.getNotes());
        dto.setDiagnostic(dossier.getDiagnostic());
        dto.setIdOrdonnance(dossier.getIdOrdonnance());

        // Récupérer les infos du docteur
        try {
            UserDTO docteur = authServiceClient.getUserById(dossier.getIdDocteur());
            dto.setNomDocteur(docteur.getNom());
            dto.setPrenomDocteur(docteur.getPrenom());
        } catch (Exception e) {
            log.warn("Impossible de récupérer les infos du docteur: {}", e.getMessage());
        }

        return dto;
    }
}