package com.ShifaTech.DoctorService.service;

import com.ShifaTech.DoctorService.client.AppointmentClient;
import com.ShifaTech.DoctorService.client.PatientClient;
import com.ShifaTech.DoctorService.dto.DoctorDTO;
import com.ShifaTech.DoctorService.dto.PatientDTO;
import com.ShifaTech.DoctorService.entity.Doctor;
import com.ShifaTech.DoctorService.entity.DoctorSpeciality;
import com.ShifaTech.DoctorService.repository.DoctorRepository;
import com.ShifaTech.DoctorService.repository.DoctorSpecialityRepository;
import com.ShifaTech.DoctorService.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

	private final DoctorRepository doctorRepository;
	private final DoctorSpecialityRepository specialityRepository;
	private final AppointmentClient appointmentClient;
	private final PatientClient patientClient;
	private final com.ShifaTech.DoctorService.client.AuthClient authClient;

	/**
	 * Get aggregated Doctor Profile (Enriched with Auth data)
	 */
	public DoctorDTO getDoctorProfile(Long idDoctor) {
		Doctor doctor = doctorRepository.findById(idDoctor)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + idDoctor));

		return mapToDTO(doctor);
	}

	@Transactional
	public DoctorDTO getDoctorProfileByUserId(Long userId) {
		return doctorRepository.findByIdUser(userId)
				.map(this::mapToDTO)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user ID: " + userId));
	}

	/**
	 * Create or Update Doctor Profile details (Speciality, etc.)
	 */
	@Transactional
	public DoctorDTO updateDoctorProfile(Long idDoctor, DoctorDTO doctorDTO) {
		Doctor doctor = doctorRepository.findById(idDoctor)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

		// Update Local Fields
		if (doctorDTO.getNumeroOrdre() != null)
			doctor.setNumeroOrdre(doctorDTO.getNumeroOrdre());

		if (doctorDTO.getIdSpecialite() != null) {
			DoctorSpeciality spec = specialityRepository.findById(doctorDTO.getIdSpecialite())
					.orElseThrow(() -> new RuntimeException("Speciality not found"));
			doctor.setSpecialite(spec);
		}

		doctor = doctorRepository.save(doctor);

		return getDoctorProfile(idDoctor);
	}

	public List<DoctorDTO> getAllDoctors() {
		return doctorRepository.findAll().stream()
				.map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	@Transactional
	public DoctorDTO createDoctor(DoctorDTO doctorDTO) {
		Long idUserToUse = doctorDTO.getIdUser();

		if (idUserToUse == null) {
			throw new IllegalArgumentException("idUser is required to create a Doctor profile");
		}

		// Check if profile already exists
		if (doctorRepository.findByIdUser(idUserToUse).isPresent()) {
			throw new IllegalStateException("Doctor profile already exists for this User (ID: " + idUserToUse + ")");
		}

		Doctor doctor = new Doctor();
		doctor.setIdUser(idUserToUse);
		doctor.setNumeroOrdre(doctorDTO.getNumeroOrdre());

		if (doctorDTO.getIdSpecialite() != null) {
			DoctorSpeciality spec = specialityRepository.findById(doctorDTO.getIdSpecialite())
					.orElseThrow(() -> new RuntimeException("Speciality not found"));
			doctor.setSpecialite(spec);
		}

		Doctor saved = doctorRepository.save(doctor);
		return mapToDTO(saved);
	}

	@Transactional
	public void deleteDoctor(Long idDoctor) {
		if (!doctorRepository.existsById(idDoctor)) {
			throw new ResourceNotFoundException("Doctor not found");
		}
		doctorRepository.deleteById(idDoctor);
	}

	public List<Object> getAppointmentsByDoctor(Long idDoctor) {
		return appointmentClient.getAppointmentsByDoctor(idDoctor);
	}

	@SuppressWarnings("unchecked")
	public List<PatientDTO> getMyPatients(Long idDoctor, String authHeader) {
		List<Object> appointments = appointmentClient.getAppointmentsByDoctor(idDoctor);
		return appointments.stream()
				.filter(obj -> obj instanceof java.util.Map)
				.map(obj -> (java.util.Map<String, Object>) obj)
				.map(map -> {
					Object pid = map.get("id_patient");
					if (pid == null)
						pid = map.get("idPatient");
					if (pid == null)
						pid = map.get("patient_id");
					return pid;
				})
				.filter(java.util.Objects::nonNull)
				.map(id -> Long.valueOf(id.toString()))
				.distinct()
				.map(patientId -> {
					try {
						return patientClient.getPatientById(patientId, authHeader).getData();
					} catch (Exception e) {
						log.error("Failed to fetch patient info for ID: " + patientId, e);
						return null;
					}
				})
				.filter(java.util.Objects::nonNull)
				.collect(Collectors.toList());
	}

	// Helper mapper
	@SuppressWarnings("unchecked")
	private DoctorDTO mapToDTO(Doctor doctor) {
		DoctorDTO dto = new DoctorDTO();
		// Local
		dto.setIdDocteur(doctor.getIdDocteur());
		dto.setIdUser(doctor.getIdUser());
		dto.setNumeroOrdre(doctor.getNumeroOrdre());

		if (doctor.getSpecialite() != null) {
			dto.setIdSpecialite(doctor.getSpecialite().getIdSpecialite());
			dto.setSpecialiteLabel(doctor.getSpecialite().getLabel());
		}

		dto.setIdService(doctor.getIdService());
		dto.setCreatedAt(doctor.getCreatedAt());
		dto.setUpdatedAt(doctor.getUpdatedAt());

		// Fetch from Auth (Enrichment)
		try {
			java.util.Map<String, Object> response = authClient.getUserById(doctor.getIdUser());
			if (response != null && response.get("user") != null) {
				java.util.Map<String, Object> user = (java.util.Map<String, Object>) response.get("user");
				dto.setNom((String) user.get("nom"));
				dto.setPrenom((String) user.get("prenom"));
				dto.setEmail((String) user.get("email"));
				dto.setSexe((String) user.get("sexe"));
				dto.setStatut((Boolean) user.get("statut"));
			}
		} catch (Exception e) {
			log.error("Failed to fetch user info from auth-service for userId: " + doctor.getIdUser(), e);
		}

		return dto;
	}
}