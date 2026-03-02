package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.dto.ApiResponse;
import com.shifatech.patient_service.dto.CreateRendezVousRequest;
import com.shifatech.patient_service.dto.RendezVousDTO;
import com.shifatech.patient_service.service.PatientRdvService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient/rdv")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PatientRdvController {

    private final PatientRdvService patientRdvService;

    @PreAuthorize("hasRole('PATIENT')")
    @PostMapping
    public ResponseEntity<ApiResponse<RendezVousDTO>> takeAppointment(
            @Valid @RequestBody CreateRendezVousRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête de prise de rendez-vous pour patient ID: {}", request.getIdPatient());
        RendezVousDTO rdv = patientRdvService.takeAppointment(request, authHeader);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(rdv, "Rendez-vous pris avec succès"));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Requête d'annulation du rendez-vous ID: {}", id);
        patientRdvService.cancelAppointment(id, authHeader);
        return ResponseEntity.ok(ApiResponse.success(null, "Rendez-vous annulé avec succès"));
    }
}
