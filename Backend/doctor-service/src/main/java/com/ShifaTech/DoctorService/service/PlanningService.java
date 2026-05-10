package com.ShifaTech.DoctorService.service;

import com.ShifaTech.DoctorService.dto.PlanningDTO;
import com.ShifaTech.DoctorService.entity.Doctor;
import com.ShifaTech.DoctorService.entity.Planning;
import com.ShifaTech.DoctorService.repository.DoctorRepository;
import com.ShifaTech.DoctorService.repository.PlanningRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanningService {

    @Value("${app.admin-service-url:http://admin-service:8080}")
    private String adminServiceUrl;

    private final PlanningRepository planningRepository;
    private final DoctorRepository doctorRepository;

    public List<PlanningDTO> getPlanningByDoctor(Long idDoctor) {
        List<Planning> plans = planningRepository.findByDoctorIdDocteur(idDoctor);
        return plans.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public PlanningDTO addPlanningSlot(PlanningDTO planningDTO) {
        Doctor doctor = doctorRepository.findById(planningDTO.getIdDoctor())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Planning planning = new Planning();
        planning.setDoctor(doctor);
        planning.setJour(planningDTO.getJour());
        planning.setHeureDebut(planningDTO.getHeureDebut());
        planning.setHeureFin(planningDTO.getHeureFin());
        planning.setPauseDebut(planningDTO.getPauseDebut());
        planning.setPauseFin(planningDTO.getPauseFin());

        Planning saved = planningRepository.save(planning);
        return mapToDTO(saved);
    }

    @Transactional
    public PlanningDTO updatePlanningSlot(Long id, PlanningDTO planningDTO) {
        Planning planning = planningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Planning slot not found"));

        boolean isPauseModifie = false;

        if (planningDTO.getJour() != null)
            planning.setJour(planningDTO.getJour());
        if (planningDTO.getHeureDebut() != null)
            planning.setHeureDebut(planningDTO.getHeureDebut());
        if (planningDTO.getHeureFin() != null)
            planning.setHeureFin(planningDTO.getHeureFin());
            
        if (planningDTO.getPauseDebut() != null) {
            if (!planningDTO.getPauseDebut().equals(planning.getPauseDebut())) isPauseModifie = true;
            planning.setPauseDebut(planningDTO.getPauseDebut());
        }
        if (planningDTO.getPauseFin() != null) {
            if (!planningDTO.getPauseFin().equals(planning.getPauseFin())) isPauseModifie = true;
            planning.setPauseFin(planningDTO.getPauseFin());
        }

        Planning saved = planningRepository.save(planning);

        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> payload = new HashMap<>();
            payload.put("idDocteur", saved.getDoctor().getIdDocteur());
            payload.put("statut", isPauseModifie ? "PAUSE_MODIFIE" : "MODIFIE");
            payload.put("dateRdv", saved.getJour().toString() + " " + saved.getHeureDebut());

            restTemplate.postForEntity(adminServiceUrl + "/api/admin/planning-events", payload, Void.class);
            log.info("Événement de planning envoyé avec succès à admin-service");
        } catch (Exception e) {
            log.warn("Impossible de notifier admin-service du changement de planning : {}", e.getMessage());
        }

        return mapToDTO(saved);
    }

    @Transactional
    public void deletePlanningSlot(Long id) {
        if (!planningRepository.existsById(id)) {
            throw new RuntimeException("Planning slot not found");
        }
        planningRepository.deleteById(id);
    }

    private PlanningDTO mapToDTO(Planning planning) {
        PlanningDTO dto = new PlanningDTO();
        dto.setIdPlan(planning.getIdPlan());
        dto.setIdDoctor(planning.getDoctor().getIdDocteur());
        dto.setJour(planning.getJour());
        dto.setHeureDebut(planning.getHeureDebut());
        dto.setHeureFin(planning.getHeureFin());
        dto.setPauseDebut(planning.getPauseDebut());
        dto.setPauseFin(planning.getPauseFin());
        dto.setCreatedAt(planning.getCreatedAt());
        dto.setUpdatedAt(planning.getUpdatedAt());
        return dto;
    }
}
