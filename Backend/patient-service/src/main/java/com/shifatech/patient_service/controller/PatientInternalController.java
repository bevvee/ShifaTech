package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.*;
import com.shifatech.patient_service.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur interne pour permettre aux autres services de consommer les APIs
 * patient
 * Ce contrôleur est accessible sans authentification pour faciliter la
 * communication inter-services
 */
@RestController
@RequestMapping("/api/patient/internal")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PatientInternalController {

    private final PatientService patientService;

    /**
     * Créer un nouveau patient (appel interne)
     * POST /api/patient/internal/patients
     */
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
    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        log.info("[INTERNAL] Récupération de tous les patients");
        return ResponseEntity.ok(patientService.getAllPatients(null));
    }

    /**
     * Obtenir un patient par son ID (appel interne)
     * GET /api/patient/internal/patients/{id}
     */
    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        log.info("[INTERNAL] Récupération du patient avec l'ID: {}", id);
        return ResponseEntity.ok(patientService.getPatientById(id, null));
    }

    /**
     * Obtenir un patient par l'ID utilisateur (appel interne)
     * GET /api/patient/internal/patients/user/{idUser}
     */
    @GetMapping("/patients/user/{idUser}")
    public ResponseEntity<PatientDTO> getPatientByUserId(@PathVariable Long idUser) {
        log.info("[INTERNAL] Récupération du patient pour l'utilisateur: {}", idUser);
        return ResponseEntity.ok(patientService.getPatientByUserId(idUser, null));
    }

    /**
     * Mettre à jour un patient (appel interne)
     * PUT /api/patient/internal/patients/{id}
     */
    @PutMapping("/patients/{id}")
    public ResponseEntity<PatientDTO> updatePatient(
            @PathVariable Long id,
            @RequestBody UpdatePatientRequest request) {
        log.info("[INTERNAL] Mise à jour du patient avec l'ID: {}", id);
        // On récupère d'abord le patient pour avoir son ID utilisateur pour le updatedBy
        PatientDTO currentPatient = patientService.getPatientById(id, null);
        PatientDTO updatedPatient = patientService.updatePatient(id, request, currentPatient.getIdUser(), null);
        return ResponseEntity.ok(updatedPatient);
    }

    /**
     * Supprimer un patient (appel interne)
     * DELETE /api/patient/internal/patients/{id}
     */
    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        log.info("[INTERNAL] Suppression du patient avec l'ID: {}", id);
        PatientDTO currentPatient = patientService.getPatientById(id, null);
        patientService.deletePatient(id, currentPatient.getIdUser());
        return ResponseEntity.noContent().build();
    }
}
