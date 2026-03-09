package com.ShifaTech.DoctorService.controller;

import com.ShifaTech.DoctorService.dto.DoctorDTO;
import com.ShifaTech.DoctorService.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// @RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // --- CRUD Operations ---

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTEUR')")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @PostMapping("/c")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorDTO> createDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        return ResponseEntity.ok(doctorService.createDoctor(doctorDTO));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    // --- Profile Management ---

    @GetMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTEUR', 'PATIENT')")
    public ResponseEntity<DoctorDTO> getDoctorProfile(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorProfile(id));
    }

    @PutMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTEUR')")
    public ResponseEntity<DoctorDTO> updateDoctorProfile(@PathVariable Long id,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(id, doctorDTO));
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Doctor Service is running!");
    }
}