package com.ShifaTech.DoctorService.controller;

import com.ShifaTech.DoctorService.client.PatientClient;
import com.ShifaTech.DoctorService.dto.ConsultationDTO;
import com.ShifaTech.DoctorService.dto.DoctorDTO;
import com.ShifaTech.DoctorService.dto.PatientDTO;
import com.ShifaTech.DoctorService.dto.PrescriptionDTO;
import com.ShifaTech.DoctorService.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final PatientClient patientClient;

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

    // --- Patient Management Interactions ---

    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTEUR')")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        return ResponseEntity.ok(patientClient.getAllPatients());
    }

    @GetMapping("/patients/{id}/medical-record")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTEUR')")
    public ResponseEntity<ConsultationDTO> getMedicalRecord(@PathVariable Long id) {
        return ResponseEntity.ok(patientClient.getMedicalRecordByPatient(id));
    }

    @PostMapping("/patients/medical-record")
    @PreAuthorize("hasRole('DOCTEUR')")
    public ResponseEntity<ConsultationDTO> addMedicalRecord(@RequestBody ConsultationDTO consultationDTO) {
        return ResponseEntity.ok(patientClient.addMedicalRecord(consultationDTO));
    }

    @PostMapping("/prescriptions")
    @PreAuthorize("hasRole('DOCTEUR')")
    public ResponseEntity<PrescriptionDTO> createPrescription(@RequestBody PrescriptionDTO prescriptionDTO) {
        return ResponseEntity.ok(patientClient.createPrescription(prescriptionDTO));
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Doctor Service is running!");
    }
}