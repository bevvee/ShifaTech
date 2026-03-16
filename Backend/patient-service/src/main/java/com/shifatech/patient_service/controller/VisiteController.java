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
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// @RequestMapping("/api/patient")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VisiteController {

    private final VisiteService visiteService;
    private final JwtUtil jwtUtil;

    //@PreAuthorize("hasAnyRole('ADMIN', 'INFIRMIER', 'DOCTEUR')")
    @GetMapping("/dossier/{idDossier}/visites")
    public ResponseEntity<ApiResponse<List<VisiteDTO>>> getVisitesByDossier(
            @PathVariable Long idDossier,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération des visites pour le dossier ID: {}", idDossier);
        List<VisiteDTO> visites = visiteService.getVisitesByDossierId(idDossier, authHeader);
        return ResponseEntity.ok(ApiResponse.success(visites,
                 String.format("%d visite(s) trouvée(s)", visites.size())));
    }

   // @PreAuthorize("hasAnyRole('ADMIN', 'INFIRMIER', 'DOCTEUR')")
    @GetMapping("/visites")
    public ResponseEntity<ApiResponse<List<VisiteDTO>>> getAllVisites(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération de toutes les visites");
        List<VisiteDTO> visites = visiteService.getAllVisites(authHeader);
        return ResponseEntity.ok(ApiResponse.success(visites, "Toutes les visites récupérées"));
    }

    //@PreAuthorize("hasAnyRole('ADMIN', 'INFIRMIER', 'DOCTEUR')")
    @GetMapping("/visites/{id}")
    public ResponseEntity<ApiResponse<VisiteDTO>> getVisiteById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de récupération de la visite ID: {}", id);
        VisiteDTO visite = visiteService.getVisiteById(id, authHeader);
        return ResponseEntity.ok(ApiResponse.success(visite, "Visite récupérée avec succès"));
    }

    // @PreAuthorize("hasRole('INFIRMIER')")
    //@PreAuthorize("hasAnyRole('INFIRMIER', 'DOCTEUR', 'ADMIN')")
    @PostMapping("/visites")
    public ResponseEntity<ApiResponse<VisiteDTO>> createVisite(
            @Valid @RequestBody CreateVisiteRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de création d'une visite pour le dossier ID: {}", request.getIdDossier());
        Long createdBy = jwtUtil.getUserIdFromToken();
        VisiteDTO visite = visiteService.createVisite(request, createdBy, authHeader);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(visite, "Visite créée avec succès"));
    }

    // @PreAuthorize("hasRole('INFIRMIER')")
    //@PreAuthorize("hasAnyRole('INFIRMIER', 'DOCTEUR', 'ADMIN')")
    @PutMapping("/visites/{id}")
    public ResponseEntity<ApiResponse<VisiteDTO>> updateVisite(
            @PathVariable Long id,
            @Valid @RequestBody CreateVisiteRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de mise à jour de la visite ID: {}", id);
        VisiteDTO visite = visiteService.updateVisite(id, request, authHeader);
        return ResponseEntity.ok(ApiResponse.success(visite, "Visite mise à jour avec succès"));
    }

    // @PreAuthorize("hasAnyRole('ADMIN', 'INFIRMIER')")
    //@PreAuthorize("hasAnyRole('ADMIN', 'INFIRMIER', 'DOCTEUR')")
    @DeleteMapping("/visites/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVisite(
            @PathVariable Long id) {
        log.info("Requête de suppression de la visite ID: {}", id);
        visiteService.deleteVisite(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Visite supprimée avec succès"));
    }
}
