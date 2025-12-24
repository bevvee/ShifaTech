package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.AuthServiceClient;
import com.shifatech.patient_service.dto.AfficheDTO;
import com.shifatech.patient_service.dto.UserDTO;
import com.shifatech.patient_service.entity.Affiche;
import com.shifatech.patient_service.repository.AfficheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AfficheService {

    private final AfficheRepository afficheRepository;
    private final AuthServiceClient authServiceClient;

    /**
     * Récupérer toutes les affiches d'un patient
     */
    public List<AfficheDTO> getAffichesByPatient(Long idPatient) {
        log.info("Récupération des affiches pour le patient: {}", idPatient);

        List<Affiche> affiches = afficheRepository.findByIdPatientOrderByDateCreationDesc(idPatient);

        return affiches.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer une affiche par ID
     */
    public AfficheDTO getAfficheById(Long idAffiche) {
        log.info("Récupération de l'affiche: {}", idAffiche);

        Affiche affiche = afficheRepository.findById(idAffiche)
                .orElseThrow(() -> new RuntimeException("Affiche non trouvée: " + idAffiche));

        return convertToDTO(affiche);
    }

    /**
     * Récupérer toutes les affiches publiques (pour tous les patients)
     */
    public List<AfficheDTO> getAllAffiches() {
        log.info("Récupération de toutes les affiches");

        List<Affiche> affiches = afficheRepository.findAllByOrderByDateCreationDesc();

        return affiches.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Conversion Affiche -> DTO
     */
    private AfficheDTO convertToDTO(Affiche affiche) {
        AfficheDTO dto = new AfficheDTO();
        dto.setIdAffiche(affiche.getIdAffiche());
        dto.setIdPatient(affiche.getIdPatient());
        dto.setIdDocteur(affiche.getIdDocteur());
        dto.setDateCreation(affiche.getDateCreation());
        dto.setTitre(affiche.getTitre());

        // Récupérer les infos du docteur
        try {
            UserDTO docteur = authServiceClient.getUserById(affiche.getIdDocteur());
            dto.setNomDocteur(docteur.getNom());
            dto.setPrenomDocteur(docteur.getPrenom());
        } catch (Exception e) {
            log.warn("Impossible de récupérer les infos du docteur: {}", e.getMessage());
        }

        return dto;
    }
}