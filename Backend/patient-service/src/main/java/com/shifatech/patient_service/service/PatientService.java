package com.shifatech.patient_service.service;

import com.shifatech.patient_service.dto.PatientDTO;
import com.shifatech.patient_service.entity.Patient;
import com.shifatech.patient_service.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;

    // Récupérer un patient par ID user
    public PatientDTO getPatientByUserId(Long idUser) {
        Patient patient = patientRepository.findByIdUser(idUser)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé pour l'utilisateur: " + idUser));
        return convertToDTO(patient);
    }

    // Récupérer un patient par ID
    public PatientDTO getPatientById(Long idPatient) {
        Patient patient = patientRepository.findById(idPatient)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec l'id: " + idPatient));
        return convertToDTO(patient);
    }

    // Créer un patient (appelé lors de la création d'un utilisateur)
    public PatientDTO createPatient(PatientDTO patientDTO) {
        Patient patient = new Patient();
        patient.setIdUser(patientDTO.getIdUser());
        patient.setNumDossier(patientDTO.getNumDossier());
        patient.setPoids(patientDTO.getPoids());
        patient.setTaille(patientDTO.getTaille());

        Patient savedPatient = patientRepository.save(patient);
        return convertToDTO(savedPatient);
    }

    // Mettre à jour les données médicales
    public PatientDTO updatePatientMedicalData(Long idUser, PatientDTO patientDTO) {
        Patient patient = patientRepository.findByIdUser(idUser)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé pour l'utilisateur: " + idUser));

        patient.setPoids(patientDTO.getPoids());
        patient.setTaille(patientDTO.getTaille());
        patient.setNumDossier(patientDTO.getNumDossier());

        Patient updatedPatient = patientRepository.save(patient);
        return convertToDTO(updatedPatient);
    }

    // Récupérer tous les patients
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Conversion
    private PatientDTO convertToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setIdPatient(patient.getIdPatient());
        dto.setIdUser(patient.getIdUser());
        dto.setNumDossier(patient.getNumDossier());
        dto.setPoids(patient.getPoids());
        dto.setTaille(patient.getTaille());
        return dto;
    }
}