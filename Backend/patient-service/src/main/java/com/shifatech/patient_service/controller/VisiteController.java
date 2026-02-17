package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.ApiResponse;
import com.shifatech.patient_service.dto.CreateVisiteRequest;
import com.shifatech.patient_service.dto.VisiteDTO;
import com.shifatech.patient_service.security.JwtUtil;
import com.shifatech.patient_service.service.VisiteService;
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
public class VisiteController {

    private final VisiteService visiteService;
    private final JwtUtil jwtUtil;

    @GetMapping("/dossier/{idDossier}/visites")
    public ResponseEntity<ApiResponse<List<VisiteDTO>>> getVisitesByDossier(
            @PathVariable Long idDossier) {
        log.info("Requête de récupération des visites pour le dossier ID: {}", idDossier);
        List<VisiteDTO> visites = visiteService.getVisitesByDossierId(idDossier);
        return ResponseEntity.ok(ApiResponse.success(visites,
                String.format("%d visite(s) trouvée(s)", visites.size())));
    }

    @GetMapping("/visites/{id}")
    public ResponseEntity<ApiResponse<VisiteDTO>> getVisiteById(
            @PathVariable Long id) {
        log.info("Requête de récupération de la visite ID: {}", id);
        VisiteDTO visite = visiteService.getVisiteById(id);
        return ResponseEntity.ok(ApiResponse.success(visite, "Visite récupérée avec succès"));
    }

    @PostMapping("/visites")
    public ResponseEntity<ApiResponse<VisiteDTO>> createVisite(
            @Valid @RequestBody CreateVisiteRequest request) {
        log.info("Requête de création d'une visite pour le dossier ID: {}", request.getIdDossier());
        Long createdBy = jwtUtil.getUserIdFromToken();
        VisiteDTO visite = visiteService.createVisite(request, createdBy);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(visite, "Visite créée avec succès"));
    }
}
