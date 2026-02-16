package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.ApiResponse;
import com.shifatech.patient_service.dto.CreatePatientRequest;
import com.shifatech.patient_service.dto.PatientDTO;
import com.shifatech.patient_service.dto.UpdatePatientRequest;
import com.shifatech.patient_service.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient Management", description = "API de gestion des patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @Operation(
            summary = "Créer un nouveau patient",
            description = "Créer un nouveau dossier patient à partir d'un compte utilisateur existant"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Patient créé avec succès",
                    content = @Content(schema = @Schema(implementation = PatientDTO.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Données invalides"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "Un patient existe déjà pour cet utilisateur"
            )
    })
    public ResponseEntity<ApiResponse<PatientDTO>> createPatient(
            @Valid @RequestBody CreatePatientRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId
    ) {
        log.info("Requête de création de patient reçue pour userId: {}", request.getIdUser());
        PatientDTO patient = patientService.createPatient(request, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(patient, "Patient créé avec succès"));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Récupérer un patient par ID",
            description = "Récupère les informations détaillées d'un patient par son identifiant"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Patient trouvé",
                    content = @Content(schema = @Schema(implementation = PatientDTO.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Patient non trouvé"
            )
    })
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(
            @Parameter(description = "ID du patient", required = true)
            @PathVariable Long id
    ) {
        log.info("Requête de récupération du patient ID: {}", id);
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient récupéré avec succès"));
    }

    @GetMapping("/user/{userId}")
    @Operation(
            summary = "Récupérer un patient par ID utilisateur",
            description = "Récupère les informations d'un patient à partir de son ID utilisateur"
    )
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByUserId(
            @Parameter(description = "ID de l'utilisateur", required = true)
            @PathVariable Long userId
    ) {
        log.info("Requête de récupération du patient par userId: {}", userId);
        PatientDTO patient = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient récupéré avec succès"));
    }

    @GetMapping
    @Operation(
            summary = "Lister tous les patients",
            description = "Récupère la liste de tous les patients actifs"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Liste des patients récupérée avec succès"
            )
    })
    public ResponseEntity<ApiResponse<List<PatientDTO>>> getAllPatients() {
        log.info("Requête de récupération de tous les patients");
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success(patients,
                String.format("%d patient(s) trouvé(s)", patients.size())));
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Mettre à jour un patient",
            description = "Met à jour les informations d'un patient existant"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Patient mis à jour avec succès",
                    content = @Content(schema = @Schema(implementation = PatientDTO.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Patient non trouvé"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Données invalides"
            )
    })
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(
            @Parameter(description = "ID du patient", required = true)
            @PathVariable Long id,
            @Valid @RequestBody UpdatePatientRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId
    ) {
        log.info("Requête de mise à jour du patient ID: {}", id);
        PatientDTO patient = patientService.updatePatient(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient mis à jour avec succès"));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Supprimer un patient",
            description = "Effectue une suppression logique (soft delete) d'un patient"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Patient supprimé avec succès"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Patient non trouvé"
            )
    })
    public ResponseEntity<ApiResponse<Void>> deletePatient(
            @Parameter(description = "ID du patient", required = true)
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId
    ) {
        log.info("Requête de suppression du patient ID: {}", id);
        patientService.deletePatient(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Patient supprimé avec succès"));
    }
}