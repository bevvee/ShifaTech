package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.ApiResponse;
import com.shifatech.patient_service.dto.CreateOrdonnanceRequest;
import com.shifatech.patient_service.dto.OrdonnanceDTO;
import com.shifatech.patient_service.security.JwtUtil;
import com.shifatech.patient_service.service.OrdonnanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// @RequestMapping("/api/patient")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;
    private final JwtUtil jwtUtil;

    @PreAuthorize("hasAnyRole('DOCTEUR', 'ADMIN')")
    @GetMapping("/{idPatient}/ordonnances")
    public ResponseEntity<ApiResponse<List<OrdonnanceDTO>>> getOrdonnancesByPatient(
            @PathVariable Long idPatient) {
        log.info("Requête de récupération des ordonnances pour le patient ID: {}", idPatient);
        List<OrdonnanceDTO> ordonnances = ordonnanceService.getOrdonnancesByPatientId(idPatient);
        return ResponseEntity.ok(ApiResponse.success(ordonnances,
                String.format("%d ordonnance(s) trouvée(s)", ordonnances.size())));
    }

    @PreAuthorize("hasAnyRole('DOCTEUR', 'ADMIN')")
    @GetMapping("/ordonnances")
    public ResponseEntity<ApiResponse<List<OrdonnanceDTO>>> getAllOrdonnances() {
        log.info("Requête de récupération de toutes les ordonnances");
        List<OrdonnanceDTO> ordonnances = ordonnanceService.getAllOrdonnances();
        return ResponseEntity.ok(ApiResponse.success(ordonnances, "Toutes les ordonnances récupérées"));
    }

    @PreAuthorize("hasAnyRole('DOCTEUR', 'ADMIN')")
    @GetMapping("/ordonnances/{id}")
    public ResponseEntity<ApiResponse<OrdonnanceDTO>> getOrdonnanceById(
            @PathVariable Long id) {
        log.info("Requête de récupération de l'ordonnance ID: {}", id);
        OrdonnanceDTO ordonnance = ordonnanceService.getOrdonnanceById(id);
        return ResponseEntity.ok(ApiResponse.success(ordonnance, "Ordonnance récupérée avec succès"));
    }

    @PreAuthorize("hasRole('DOCTEUR')")
    @PostMapping("/ordonnances")
    public ResponseEntity<ApiResponse<OrdonnanceDTO>> createOrdonnance(
            @Valid @RequestBody CreateOrdonnanceRequest request) {
        log.info("Requête de création d'une ordonnance pour le patient ID: {}", request.getIdPatient());
        Long createdBy = jwtUtil.getUserIdFromToken();
        OrdonnanceDTO ordonnance = ordonnanceService.createOrdonnance(request, createdBy);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(ordonnance, "Ordonnance créée avec succès"));
    }

    @PreAuthorize("hasRole('DOCTEUR')")
    @PutMapping("/ordonnances/{id}")
    public ResponseEntity<ApiResponse<OrdonnanceDTO>> updateOrdonnance(
            @PathVariable Long id,
            @Valid @RequestBody CreateOrdonnanceRequest request) {
        log.info("Requête de mise à jour de l'ordonnance ID: {}", id);
        OrdonnanceDTO ordonnance = ordonnanceService.updateOrdonnance(id, request);
        return ResponseEntity.ok(ApiResponse.success(ordonnance, "Ordonnance mise à jour avec succès"));
    }

    @PreAuthorize("hasRole('DOCTEUR')")
    @DeleteMapping("/ordonnances/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrdonnance(
            @PathVariable Long id) {
        log.info("Requête de suppression de l'ordonnance ID: {}", id);
        ordonnanceService.deleteOrdonnance(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Ordonnance supprimée avec succès"));
    }
}
