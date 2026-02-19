package com.ShifaTech.DoctorService.client;

import com.ShifaTech.DoctorService.dto.ConsultationDTO;
import com.ShifaTech.DoctorService.dto.PatientDTO;
import com.ShifaTech.DoctorService.dto.PrescriptionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "PATIENT-SERVICE", url = "${application.config.patient-service-url}")
public interface PatientClient {

    // Patient Operations - Matches PatientController in patient-service
    // Note: PatientController doesn't have a GET all patients endpoint at
    // /api/patient/
    // It has /api/patient/profile/{idUser}. I'll keep this as is if it was intended
    // to call a missing endpoint.
    @GetMapping("/api/patient/")
    List<PatientDTO> getAllPatients();

    @GetMapping("/api/patient/profile/{idUser}")
    PatientDTO getPatientProfile(@PathVariable("idUser") Long idUser);

    // Medical Record (Dossier Medical) Operations
    // GET /api/patient/{idPatient}/dossier-medical returns a single object in
    // patient-service
    @GetMapping("/api/patient/{idPatient}/dossier-medical")
    ConsultationDTO getMedicalRecordByPatient(@PathVariable("idPatient") Long patientId);

    @GetMapping("/api/patient/{idPatient}/dossier-medical/exists")
    boolean checkMedicalRecordExists(@PathVariable("idPatient") Long patientId);

    // Note: POST /api/patient/dossier-medical is currently missing in
    // patient-service controller
    @PostMapping("/api/patient/dossier-medical")
    ConsultationDTO addMedicalRecord(@RequestBody ConsultationDTO consultationDTO);

    // Prescription (Ordonnance) Operations
    @GetMapping("/api/patient/{idPatient}/ordonnances")
    List<PrescriptionDTO> getPrescriptionsByPatient(@PathVariable("idPatient") Long patientId);

    @GetMapping("/api/patient/ordonnances/{idOrdonnance}")
    PrescriptionDTO getPrescriptionById(@PathVariable("idOrdonnance") Long idOrdonnance);

    // Note: POST /api/patient/ordonnances is currently missing in patient-service
    // controller
    @PostMapping("/api/patient/ordonnances")
    PrescriptionDTO createPrescription(@RequestBody PrescriptionDTO prescriptionDTO);
}
