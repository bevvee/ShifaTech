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

    @GetMapping("/api/patient/")
    ApiResponse<List<PatientDTO>> getAllPatients();

    @GetMapping("/api/patient/user/{userId}")
    ApiResponse<PatientDTO> getPatientByUserId(@PathVariable("userId") Long userId);

    @GetMapping("/api/patient/{idPatient}/dossier-medical")
    ApiResponse<ConsultationDTO> getMedicalRecordByPatient(@PathVariable("idPatient") Long patientId);

    @PostMapping("/api/patient/dossier-medical")
    ApiResponse<ConsultationDTO> addMedicalRecord(@RequestBody ConsultationDTO consultationDTO);

    @GetMapping("/api/patient/{idPatient}/ordonnances")
    ApiResponse<List<PrescriptionDTO>> getPrescriptionsByPatient(@PathVariable("idPatient") Long patientId);

    @GetMapping("/api/patient/ordonnances/{idOrdonnance}")
    ApiResponse<PrescriptionDTO> getPrescriptionById(@PathVariable("idOrdonnance") Long idOrdonnance);

    @PostMapping("/api/patient/ordonnances")
    ApiResponse<PrescriptionDTO> createPrescription(@RequestBody PrescriptionDTO prescriptionDTO);
}
