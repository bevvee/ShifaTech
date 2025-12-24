package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.AuthServiceClient;
import com.shifatech.patient_service.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PatientProfileService {

    private final PatientService patientService;
    private final AuthServiceClient authServiceClient;

    /**
     * Récupérer le profil complet d'un patient
     * Combine les données du service Auth et du service Patient
     */
    public PatientProfileDTO getCompleteProfile(Long idUser) {
        log.info("Récupération du profil complet pour l'utilisateur: {}", idUser);

        // Récupérer les infos du service Auth
        UserDTO user = authServiceClient.getUserById(idUser);

        // Récupérer les données médicales
        PatientDTO patient = patientService.getPatientByUserId(idUser);

        return combineToProfile(user, patient);
    }

    /**
     * Mettre à jour le profil du patient
     * Met à jour uniquement les informations modifiables par le patient:
     * - Poids et taille (dans le service Patient)
     * - Téléphone et adresse (dans le service Auth via API)
     */
    public PatientProfileDTO updateProfile(Long idUser, UpdateProfileRequest request) {
        log.info("Mise à jour du profil pour l'utilisateur: {}", idUser);

        // Mettre à jour les données médicales (poids, taille)
        if (request.getPoids() != null || request.getTaille() != null) {
            PatientDTO patientDTO = new PatientDTO();
            patientDTO.setIdUser(idUser);
            patientDTO.setPoids(request.getPoids());
            patientDTO.setTaille(request.getTaille());

            patientService.updatePatientMedicalData(idUser, patientDTO);
        }

        // Mettre à jour les infos personnelles dans le service Auth (téléphone, adresse)
        if (request.getTelephone() != null || request.getAdresse() != null) {
            // Appel au service Auth pour mettre à jour téléphone et adresse
            authServiceClient.updateUserProfile(idUser, request.getTelephone(), request.getAdresse());
        }

        // Récupérer le profil complet mis à jour
        return getCompleteProfile(idUser);
    }

    /**
     * Combiner UserDTO et PatientDTO en PatientProfileDTO
     */
    private PatientProfileDTO combineToProfile(UserDTO user, PatientDTO patient) {
        PatientProfileDTO profile = new PatientProfileDTO();

        // Données du service Auth
        profile.setIdUser(user.getIdUser());
        profile.setNom(user.getNom());
        profile.setPrenom(user.getPrenom());
        profile.setEmail(user.getEmail());
        profile.setDateNaissance(user.getDateNaissance());
        profile.setTelephone(user.getTelephone());
        profile.setAdresse(user.getAdresse());
        profile.setGenre(user.getGenre());

        // Données médicales
        profile.setIdPatient(patient.getIdPatient());
        profile.setNumDossier(patient.getNumDossier());
        profile.setPoids(patient.getPoids());
        profile.setTaille(patient.getTaille());

        return profile;
    }
}