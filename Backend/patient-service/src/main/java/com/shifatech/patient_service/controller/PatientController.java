package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.ApiResponse;
import com.shifatech.patient_service.dto.CreatePatientRequest;
import com.shifatech.patient_service.dto.PatientDTO;
import com.shifatech.patient_service.dto.UpdatePatientRequest;
import com.shifatech.patient_service.security.JwtUtil;
import com.shifatech.patient_service.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;
    private final JwtUtil jwtUtil;

    private Long resolveUserId(Long headerUserId) {
        Long tokenUserId = jwtUtil.getUserIdFromToken();
        return tokenUserId != null ? tokenUserId : headerUserId;
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'INFIRMIER', 'DOCTEUR', 'ADMIN')")
    @PostMapping(value = { "", "/" })
    public ResponseEntity<ApiResponse<PatientDTO>> createPatient(
            @Valid @RequestBody CreatePatientRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long headerUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = resolveUserId(headerUserId);
        log.info("Requête de création de patient pour userId: {}", request.getIdUser());
        PatientDTO patient = patientService.createPatient(request, userId, authHeader);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(patient, "Patient créé avec succès"));
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTEUR', 'ADMIN', 'INFIRMIER')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération du patient ID: {}", id);
        PatientDTO patient = patientService.getPatientById(id, authHeader);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient récupéré avec succès"));
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTEUR', 'ADMIN', 'INFIRMIER')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByUserId(
            @PathVariable Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération du patient par userId: {}", userId);
        PatientDTO patient = patientService.getPatientByUserId(userId, authHeader);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient récupéré avec succès"));
    }

    @PreAuthorize("hasAnyRole('DOCTEUR', 'ADMIN', 'INFIRMIER')")
    @GetMapping(value = { "", "/" })
    public ResponseEntity<ApiResponse<List<PatientDTO>>> getAllPatients(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération de tous les patients");
        List<PatientDTO> patients = patientService.getAllPatients(authHeader);
        return ResponseEntity.ok(ApiResponse.success(patients,
                String.format("%d patient(s) trouvé(s)", patients.size())));
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'INFIRMIER', 'DOCTEUR', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePatientRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long headerUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = resolveUserId(headerUserId);
        log.info("Requête de mise à jour du patient ID: {}", id);
        PatientDTO patient = patientService.updatePatient(id, request, userId, authHeader);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient mis à jour avec succès"));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long headerUserId) {
        Long userId = resolveUserId(headerUserId);
        log.info("Requête de suppression du patient ID: {}", id);
        patientService.deletePatient(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Patient supprimé avec succès"));
    }
}
