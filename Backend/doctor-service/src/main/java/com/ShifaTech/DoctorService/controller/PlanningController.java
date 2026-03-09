package com.ShifaTech.DoctorService.controller;

import com.ShifaTech.DoctorService.dto.PlanningDTO;
import com.ShifaTech.DoctorService.service.PlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService planningService;

    @GetMapping("/{doctorId}")
    public ResponseEntity<List<PlanningDTO>> getPlanning(@PathVariable Long doctorId) {
        return ResponseEntity.ok(planningService.getPlanningByDoctor(doctorId));
    }

    @PostMapping
    public ResponseEntity<PlanningDTO> addPlanningSlot(@RequestBody PlanningDTO planningDTO) {
        return ResponseEntity.ok(planningService.addPlanningSlot(planningDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanningDTO> updatePlanningSlot(@PathVariable Long id, @RequestBody PlanningDTO planningDTO) {
        return ResponseEntity.ok(planningService.updatePlanningSlot(id, planningDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlanningSlot(@PathVariable Long id) {
        planningService.deletePlanningSlot(id);
        return ResponseEntity.noContent().build();
    }
}
