package com.shifatech.patient_service.service;

import com.shifatech.patient_service.dto.OrdonnanceDTO;
import com.shifatech.patient_service.entity.Ordonnance;
import com.shifatech.patient_service.entity.Patient;
import com.shifatech.patient_service.repository.OrdonnanceRepository;
import com.shifatech.patient_service.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrdonnanceService {

    private final OrdonnanceRepository ordonnanceRepository;
    private final PatientRepository patientRepository;

    // Récupérer les ordonnances d'un utilisateur
    public List<OrdonnanceDTO> getOrdonnancesByUser(Long idUser) {
        Patient patient = patientRepository.findByIdUser(idUser)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé pour l'utilisateur: " + idUser));

        return ordonnanceRepository.findByIdPatientOrderByDateCreationDesc(patient.getIdPatient())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Récupérer les ordonnances d'un patient par ID patient
    public List<OrdonnanceDTO> getOrdonnancesByPatient(Long idPatient) {
        return ordonnanceRepository.findByIdPatientOrderByDateCreationDesc(idPatient)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Récupérer une ordonnance par ID
    public OrdonnanceDTO getOrdonnanceById(Long idOrdonnance) {
        Ordonnance ordonnance = ordonnanceRepository.findById(idOrdonnance)
                .orElseThrow(() -> new RuntimeException("Ordonnance non trouvée avec l'id: " + idOrdonnance));
        return convertToDTO(ordonnance);
    }

    // Conversion
    private OrdonnanceDTO convertToDTO(Ordonnance ordonnance) {
        OrdonnanceDTO dto = new OrdonnanceDTO();
        dto.setIdOrdonnance(ordonnance.getIdOrdonnance());
        dto.setIdPatient(ordonnance.getIdPatient());
        dto.setIdDocteur(ordonnance.getIdDocteur());
        dto.setDateCreation(ordonnance.getDateCreation());
        dto.setDescription(ordonnance.getDescription());
        return dto;
    }
}