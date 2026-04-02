package com.ShifaTech.DoctorService.controller;

import com.ShifaTech.DoctorService.dto.DoctorDTO;
import com.ShifaTech.DoctorService.dto.PatientDTO;
import com.ShifaTech.DoctorService.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // --- CRUD Operations ---

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'INFIRMIER', 'SECRETAIRE')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTEUR', 'PATIENT','INFIRMIER')")
    public ResponseEntity<DoctorDTO> getDoctorProfile(@PathVariable Long id) {
        DoctorDTO doctor = doctorService.getDoctorProfile(id);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = doctor.getIdUser() != null && doctor.getIdUser().toString().equals(currentUserId);

        if (isAdmin || isOwner) {
            return ResponseEntity.ok(doctor);
        } else {
            return ResponseEntity.ok(doctorService.filterSensitiveInfo(doctor));
        }
    }

    @PutMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTEUR')")
    public ResponseEntity<DoctorDTO> updateDoctorProfile(@PathVariable Long id,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        DoctorDTO existingDoctor = doctorService.getDoctorProfile(id);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = existingDoctor.getIdUser() != null
                && existingDoctor.getIdUser().toString().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(doctorService.updateDoctorProfile(id, doctorDTO));
    }

    @GetMapping("/{id:[0-9]+}/rdv")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTEUR', 'INFIRMIER', 'SECRETAIRE')")
    public ResponseEntity<List<Object>> getAppointmentsForDoctor(@PathVariable Long id) {
        DoctorDTO doctor = doctorService.getDoctorProfile(id);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = doctor.getIdUser() != null && doctor.getIdUser().toString().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(doctorService.getAppointmentsByDoctor(id));
    }

    @GetMapping("/my-patients")
    @PreAuthorize("hasRole('DOCTEUR')")
    public ResponseEntity<List<PatientDTO>> getMyPatients(
            @RequestHeader("Authorization") String authHeader) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        // Assuming currentUserId is the idUser
        DoctorDTO doctor = doctorService.getDoctorProfileByUserId(Long.valueOf(currentUserId));
        return ResponseEntity.ok(doctorService.getMyPatients(doctor.getIdDocteur(), authHeader));
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Doctor Service is running!");
    }
}
