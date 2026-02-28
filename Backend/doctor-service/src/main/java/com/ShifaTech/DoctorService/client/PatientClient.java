package com.ShifaTech.DoctorService.client;

import com.ShifaTech.DoctorService.dto.ApiResponse;
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
    @GetMapping("/")
    List<PatientDTO> getAllPatients();

    @GetMapping("/profile/{idUser}")
    PatientDTO getPatientProfile(@PathVariable("idUser") Long idUser);

    // Medical Record (Dossier Medical) Operations
    // GET /{idPatient}/dossier-medical returns a single object in
    // patient-service
    @GetMapping("/{idPatient}/dossier-medical")
    ConsultationDTO getMedicalRecordByPatient(@PathVariable("idPatient") Long patientId);

    @GetMapping("/{idPatient}/dossier-medical/exists")
    boolean checkMedicalRecordExists(@PathVariable("idPatient") Long patientId);

    // Note: POST /dossier-medical is currently missing in
    // patient-service controller
    @PostMapping("/dossier-medical")
    ConsultationDTO addMedicalRecord(@RequestBody ConsultationDTO consultationDTO);

    // Prescription (Ordonnance) Operations
    @GetMapping("/{idPatient}/ordonnances")
    List<PrescriptionDTO> getPrescriptionsByPatient(@PathVariable("idPatient") Long patientId);

    @GetMapping("/ordonnances/{idOrdonnance}")
    PrescriptionDTO getPrescriptionById(@PathVariable("idOrdonnance") Long idOrdonnance);

    // Note: POST /ordonnances is currently missing in patient-service
    // controller
    @PostMapping("/ordonnances")
    PrescriptionDTO createPrescription(@RequestBody PrescriptionDTO prescriptionDTO);
}
