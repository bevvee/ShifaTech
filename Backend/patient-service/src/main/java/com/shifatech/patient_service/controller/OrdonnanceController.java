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
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;
    private final JwtUtil jwtUtil;

    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTEUR', 'ADMIN', 'INFIRMIER')")
    @GetMapping("/{idPatient}/ordonnances")
    public ResponseEntity<ApiResponse<List<OrdonnanceDTO>>> getOrdonnancesByPatient(
            @PathVariable Long idPatient,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération des ordonnances pour le patient ID: {}", idPatient);
        List<OrdonnanceDTO> ordonnances = ordonnanceService.getOrdonnancesByPatientId(idPatient, authHeader);
        return ResponseEntity.ok(ApiResponse.success(ordonnances,
                String.format("%d ordonnance(s) trouvée(s)", ordonnances.size())));
    }

    @PreAuthorize("hasAnyRole('DOCTEUR', 'ADMIN', 'INFIRMIER')")
    @GetMapping("/ordonnances")
    public ResponseEntity<ApiResponse<List<OrdonnanceDTO>>> getAllOrdonnances(
            @RequestParam(name = "id_doctor", required = false) List<Long> ids_doctor,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération des ordonnances (Filter ids_doctor: {})", ids_doctor);
        List<OrdonnanceDTO> ordonnances = ordonnanceService.getAllOrdonnances(ids_doctor, authHeader);
        return ResponseEntity.ok(ApiResponse.success(ordonnances, "Ordonnances récupérées"));
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTEUR', 'ADMIN', 'INFIRMIER')")
    @GetMapping("/ordonnances/{id}")
    public ResponseEntity<ApiResponse<OrdonnanceDTO>> getOrdonnanceById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération de l'ordonnance ID: {}", id);
        OrdonnanceDTO ordonnance = ordonnanceService.getOrdonnanceById(id, authHeader);
        return ResponseEntity.ok(ApiResponse.success(ordonnance, "Ordonnance récupérée avec succès"));
    }

    @PreAuthorize("hasAnyRole('DOCTEUR', 'ADMIN')")
    @PostMapping("/ordonnances")
    public ResponseEntity<ApiResponse<OrdonnanceDTO>> createOrdonnance(
            @Valid @RequestBody CreateOrdonnanceRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de création d'une ordonnance pour le patient ID: {}", request.getIdPatient());
        Long createdBy = jwtUtil.getUserIdFromToken();
        OrdonnanceDTO ordonnance = ordonnanceService.createOrdonnance(request, createdBy, authHeader);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(ordonnance, "Ordonnance créée avec succès"));
    }

    @PreAuthorize("hasAnyRole('DOCTEUR', 'ADMIN')")
    @PutMapping("/ordonnances/{id}")
    public ResponseEntity<ApiResponse<OrdonnanceDTO>> updateOrdonnance(
            @PathVariable Long id,
            @Valid @RequestBody CreateOrdonnanceRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de mise à jour de l'ordonnance ID: {}", id);
        OrdonnanceDTO ordonnance = ordonnanceService.updateOrdonnance(id, request, authHeader);
        return ResponseEntity.ok(ApiResponse.success(ordonnance, "Ordonnance mise à jour avec succès"));
    }

    @PreAuthorize("hasAnyRole('DOCTEUR', 'ADMIN')")
    @DeleteMapping("/ordonnances/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrdonnance(
            @PathVariable Long id) {
        log.info("Requête de suppression de l'ordonnance ID: {}", id);
        ordonnanceService.deleteOrdonnance(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Ordonnance supprimée avec succès"));
    }
}
