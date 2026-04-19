package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.*;
import com.shifatech.patient_service.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur interne pour permettre aux autres services de consommer les APIs
 * patient
 * Ce contrôleur est accessible sans authentification pour faciliter la
 * communication inter-services
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PatientInternalController {

    private final PatientService patientService;

    /**
     * Créer un nouveau patient (appel interne)
     * POST /api/patient/internal/patients
     */
    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping("/patients")
    public ResponseEntity<PatientDTO> createPatient(@RequestBody CreatePatientRequest request) {
        log.info("[INTERNAL] Création d'un nouveau patient pour l'utilisateur: {}", request.getIdUser());
        // Pour les appels internes, on passe l'ID utilisateur comme créateur
        PatientDTO createdPatient = patientService.createPatient(request, request.getIdUser(), null);
        return ResponseEntity.ok(createdPatient);
    }

    /**
     * Lister tous les patients (appel interne)
     * GET /api/patient/internal/patients
     */
    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        log.info("[INTERNAL] Récupération de tous les patients");
        return ResponseEntity.ok(patientService.getAllPatients(null));
    }

    /**
     * Obtenir un patient par son ID (appel interne)
     * GET /api/patient/internal/patients/{id}
     */
    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        log.info("[INTERNAL] Récupération du patient avec l'ID: {}", id);
        return ResponseEntity.ok(patientService.getPatientById(id, null));
    }

    /**
     * Obtenir un patient par l'ID utilisateur (appel interne)
     * GET /api/patient/internal/patients/user/{idUser}
     */
    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/patients/user/{idUser}")
    public ResponseEntity<PatientDTO> getPatientByUserId(@PathVariable Long idUser) {
        log.info("[INTERNAL] Récupération du patient pour l'utilisateur: {}", idUser);
        return ResponseEntity.ok(patientService.getPatientByUserId(idUser, null));
    }

    /**
     * Obtenir les détails complets d'un patient (appel interne par un autre service)
     * GET /internal/patients/details/{id}
     */
    @GetMapping("/patients/details/{id}")
    public ResponseEntity<PatientDTO> getFullPatientDetails(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("[INTERNAL] Requête de détails complets pour le patient ID: {}", id);
        return ResponseEntity.ok(patientService.getPatientDetailsInternal(id, authHeader));
    }

    /**
     * Obtenir les détails de plusieurs patients en masse (appel interne)
     * POST /internal/patients/bulk
     */
    @PostMapping("/patients/bulk")
    public ResponseEntity<List<PatientDTO>> getPatientsBulk(
            @RequestBody List<Long> ids,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("[INTERNAL] Requête en masse pour {} patients", ids.size());
        return ResponseEntity.ok(patientService.getPatientsBulkInternal(ids, authHeader));
    }

    /**
     * Mettre à jour un patient (appel interne)
     * PUT /internal/patients/{id}
     */
    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/patients/{id}")
    public ResponseEntity<PatientDTO> updatePatient(
            @PathVariable Long id,
            @RequestBody UpdatePatientRequest request) {
        log.info("[INTERNAL] Mise à jour du patient avec l'ID: {}", id);
        // On récupère d'abord le patient pour avoir son ID utilisateur pour le
        // updatedBy
        PatientDTO currentPatient = patientService.getPatientById(id, null);
        PatientDTO updatedPatient = patientService.updatePatient(id, request, currentPatient.getIdUser(), null);
        return ResponseEntity.ok(updatedPatient);
    }

    /**
     * Supprimer un patient (appel interne)
     * DELETE /internal/patients/{id}
     */
    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        log.info("[INTERNAL] Suppression du patient avec l'ID: {}", id);
        PatientDTO currentPatient = patientService.getPatientById(id, null);
        patientService.deletePatient(id, currentPatient.getIdUser());
        return ResponseEntity.noContent().build();
    }
}
