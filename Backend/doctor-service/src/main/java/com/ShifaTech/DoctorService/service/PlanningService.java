package com.ShifaTech.DoctorService.service;

import com.ShifaTech.DoctorService.dto.PlanningDTO;
import com.ShifaTech.DoctorService.entity.Doctor;
import com.ShifaTech.DoctorService.entity.Planning;
import com.ShifaTech.DoctorService.repository.DoctorRepository;
import com.ShifaTech.DoctorService.repository.PlanningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanningService {

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

    private PlanningDTO mapToDTO(Planning planning) {
        PlanningDTO dto = new PlanningDTO();
        dto.setIdPlan(planning.getIdPlan());
        dto.setIdDoctor(planning.getDoctor().getIdDocteur());
        dto.setJour(planning.getJour());
        dto.setHeureDebut(planning.getHeureDebut());
        dto.setHeureFin(planning.getHeureFin());
        dto.setPauseDebut(planning.getPauseDebut());
        dto.setPauseFin(planning.getPauseFin());
        return dto;
    }
}
