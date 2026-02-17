package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.ApiResponse;
import com.shifatech.patient_service.dto.DossierMedicalDTO;
import com.shifatech.patient_service.security.JwtUtil;
import com.shifatech.patient_service.service.DossierMedicalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;
    private final JwtUtil jwtUtil;

    @GetMapping("/{idPatient}/dossier-medical")
    public ResponseEntity<ApiResponse<DossierMedicalDTO>> getDossierMedical(
            @PathVariable Long idPatient) {
        log.info("Requête de récupération du dossier médical pour le patient ID: {}", idPatient);
        DossierMedicalDTO dossier = dossierMedicalService.getDossierByPatientId(idPatient);
        return ResponseEntity.ok(ApiResponse.success(dossier, "Dossier médical récupéré avec succès"));
    }

    @PostMapping("/dossier-medical")
    public ResponseEntity<ApiResponse<DossierMedicalDTO>> createDossier(
            @Valid @RequestBody com.shifatech.patient_service.dto.CreateDossierRequest request) {
        // Le patient ID est dans le body
        log.info("Requête de création de dossier médical pour patient ID: {}", request.getIdPatient());
        Long createdBy = jwtUtil.getUserIdFromToken();
        DossierMedicalDTO dossier = dossierMedicalService.createDossier(
                request.getIdPatient(),
                request.getNotes(),
                request.getDiagnostic(),
                createdBy);
        return ResponseEntity.ok(ApiResponse.success(dossier, "Dossier médical créé avec succès"));
    }

    @PutMapping("/{idPatient}/dossier-medical")
    public ResponseEntity<ApiResponse<DossierMedicalDTO>> updateDossier(
            @PathVariable Long idPatient,
            @RequestBody com.shifatech.patient_service.dto.UpdateDossierRequest request) {
        log.info("Requête de mise à jour du dossier médical pour patient ID: {}", idPatient);
        Long updatedBy = jwtUtil.getUserIdFromToken();
        DossierMedicalDTO dossier = dossierMedicalService.updateDossier(
                idPatient,
                request.getNotes(),
                request.getDiagnostic(),
                updatedBy);
        return ResponseEntity.ok(ApiResponse.success(dossier, "Dossier médical mis à jour avec succès"));
    }
}
