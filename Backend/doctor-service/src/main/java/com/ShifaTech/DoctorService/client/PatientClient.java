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

    @GetMapping("/")
    ApiResponse<List<PatientDTO>> getAllPatients(@RequestHeader("Authorization") String authHeader);

    @GetMapping("/{id}")
    ApiResponse<PatientDTO> getPatientById(@PathVariable("id") Long id,
            @RequestHeader("Authorization") String authHeader);

    @GetMapping("/user/{userId}")
    ApiResponse<PatientDTO> getPatientByUserId(@PathVariable("userId") Long userId,
            @RequestHeader("Authorization") String authHeader);

    @GetMapping("/{idPatient}/dossier-medical")
    ConsultationDTO getMedicalRecordByPatient(@PathVariable("idPatient") Long patientId);

    @GetMapping("/{idPatient}/dossier-medical/exists")
    boolean checkMedicalRecordExists(@PathVariable("idPatient") Long patientId);

    @PostMapping("/dossier-medical")
    ConsultationDTO addMedicalRecord(@RequestBody ConsultationDTO consultationDTO);

    @GetMapping("/{idPatient}/ordonnances")
    List<PrescriptionDTO> getPrescriptionsByPatient(@PathVariable("idPatient") Long patientId);

    @GetMapping("/ordonnances/{idOrdonnance}")
    PrescriptionDTO getPrescriptionById(@PathVariable("idOrdonnance") Long idOrdonnance);

    @PostMapping("/ordonnances")
    PrescriptionDTO createPrescription(@RequestBody PrescriptionDTO prescriptionDTO);
}
