package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.ApiResponse;
import com.shifatech.patient_service.dto.CreateDossierRequest;
import com.shifatech.patient_service.dto.DossierMedicalDTO;
import com.shifatech.patient_service.dto.UpdateDossierRequest;
import com.shifatech.patient_service.security.JwtUtil;
import com.shifatech.patient_service.service.DossierMedicalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;
    private final JwtUtil jwtUtil;

    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTEUR', 'ADMIN', 'INFIRMIER')")
    @GetMapping("/{idPatient}/dossier-medical")
    public ResponseEntity<ApiResponse<DossierMedicalDTO>> getDossierMedical(
            @PathVariable Long idPatient,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération du dossier médical pour le patient ID: {}", idPatient);
        DossierMedicalDTO dossier = dossierMedicalService.getDossierMedicalByPatient(idPatient, authHeader);
        return ResponseEntity.ok(ApiResponse.success(dossier, "Dossier médical récupéré avec succès"));
    }

    @PreAuthorize("hasAnyRole('INFIRMIER', 'DOCTEUR', 'ADMIN')")
    @GetMapping("/dossiers")
    public ResponseEntity<ApiResponse<java.util.List<DossierMedicalDTO>>> getAllDossiers(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération de tous les dossiers médicaux");
        java.util.List<DossierMedicalDTO> dossiers = dossierMedicalService.getAllDossiers(authHeader);
        return ResponseEntity.ok(ApiResponse.success(dossiers, "Tous les dossiers médicaux récupérés"));
    }

    @PreAuthorize("hasAnyRole('INFIRMIER', 'DOCTEUR', 'ADMIN')")
    @PostMapping("/dossier-medical")
    public ResponseEntity<ApiResponse<DossierMedicalDTO>> createDossier(
            @Valid @RequestBody CreateDossierRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de création de dossier médical pour patient ID: {}", request.getIdPatient());
        Long createdBy = jwtUtil.getUserIdFromToken();
        DossierMedicalDTO dossier = dossierMedicalService.createDossier(
                request.getIdPatient(),
                request,
                createdBy,
                authHeader);
        return ResponseEntity.ok(ApiResponse.success(dossier, "Dossier médical créé avec succès"));
    }

    @PreAuthorize("hasAnyRole('INFIRMIER', 'DOCTEUR', 'ADMIN')")
    @PutMapping("/{idPatient}/dossier-medical")
    public ResponseEntity<ApiResponse<DossierMedicalDTO>> updateDossier(
            @PathVariable Long idPatient,
            @Valid @RequestBody UpdateDossierRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de mise à jour du dossier médical pour patient ID: {}", idPatient);
        Long updatedBy = jwtUtil.getUserIdFromToken();
        DossierMedicalDTO dossier = dossierMedicalService.updateDossier(
                idPatient,
                request,
                updatedBy,
                authHeader);
        return ResponseEntity.ok(ApiResponse.success(dossier, "Dossier médical mis à jour avec succès"));
    }

    @PreAuthorize("hasAnyRole('INFIRMIER', 'ADMIN', 'DOCTEUR')")
    @DeleteMapping("/{idPatient}/dossier-medical")
    public ResponseEntity<ApiResponse<Void>> deleteDossier(
            @PathVariable Long idPatient) {
        log.info("Requête de suppression du dossier médical pour patient ID: {}", idPatient);
        dossierMedicalService.deleteDossier(idPatient);
        return ResponseEntity.ok(ApiResponse.success(null, "Dossier médical supprimé avec succès"));
    }
}
