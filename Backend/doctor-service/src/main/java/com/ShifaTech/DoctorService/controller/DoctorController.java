package com.ShifaTech.DoctorService.controller;

import com.ShifaTech.DoctorService.entity.Doctor;
import com.ShifaTech.DoctorService.service.DoctorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // GET /api/doctors - Récupérer tous les docteurs
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    // GET /api/doctors/{id} - Récupérer un docteur par ID
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        try {
            Doctor doctor = doctorService.getDoctorById(id);
            return ResponseEntity.ok(doctor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/doctors - Créer un nouveau docteur
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        Doctor createdDoctor = doctorService.createDoctor(doctor);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDoctor);
    }

    // PUT /api/doctors/{id} - Mettre à jour un docteur
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctorDetails) {
        try {
            Doctor updatedDoctor = doctorService.updateDoctor(id, doctorDetails);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/doctors/{id} - Supprimer un docteur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteDoctor(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/doctors/count - Compter le nombre de docteurs
    @GetMapping("/count")
    public ResponseEntity<Long> countDoctors() {
        long count = doctorService.countDoctors();
        return ResponseEntity.ok(count);
    }
    /**
     * Health check
     * GET /api/doctors/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Doctor Service is running!");
    }
}