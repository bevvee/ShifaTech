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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;
    private final JwtUtil jwtUtil;

    @GetMapping("/{idPatient}/ordonnances")
    public ResponseEntity<ApiResponse<List<OrdonnanceDTO>>> getOrdonnancesByPatient(
            @PathVariable Long idPatient) {
        log.info("Requête de récupération des ordonnances pour le patient ID: {}", idPatient);
        List<OrdonnanceDTO> ordonnances = ordonnanceService.getOrdonnancesByPatientId(idPatient);
        return ResponseEntity.ok(ApiResponse.success(ordonnances,
                String.format("%d ordonnance(s) trouvée(s)", ordonnances.size())));
    }

    @GetMapping("/ordonnances/{id}")
    public ResponseEntity<ApiResponse<OrdonnanceDTO>> getOrdonnanceById(
            @PathVariable Long id) {
        log.info("Requête de récupération de l'ordonnance ID: {}", id);
        OrdonnanceDTO ordonnance = ordonnanceService.getOrdonnanceById(id);
        return ResponseEntity.ok(ApiResponse.success(ordonnance, "Ordonnance récupérée avec succès"));
    }

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
}
