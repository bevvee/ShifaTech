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
import com.ShifaTech.DoctorService.dto.ApiResponse;

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
		List<Doctor> doctors = doctorRepository.findByIdUser(userId);
		if (doctors.isEmpty()) {
			throw new ResourceNotFoundException("Doctor profile not found for user ID: " + userId);
		}
		return mapToDTO(doctors.get(0));
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
					.orElseThrow(() -> new ResourceNotFoundException(
							"Speciality not found with id: " + doctorDTO.getIdSpecialite()));
			doctor.setSpecialite(spec);
		}

		if (doctorDTO.getIdService() != null) {
			doctor.setIdService(doctorDTO.getIdService());
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
		if (!doctorRepository.findByIdUser(idUserToUse).isEmpty()) {
			throw new IllegalStateException("Doctor profile already exists for this User (ID: " + idUserToUse + ")");
		}

		// Check if numeroOrdre is already used
		if (doctorDTO.getNumeroOrdre() != null
				&& !doctorRepository.findByNumeroOrdre(doctorDTO.getNumeroOrdre()).isEmpty()) {
			throw new IllegalStateException(
					"Doctor profile already exists with this Numero d'Ordre: " + doctorDTO.getNumeroOrdre());
		}

		Doctor doctor = new Doctor();
		doctor.setIdUser(idUserToUse);
		doctor.setNumeroOrdre(doctorDTO.getNumeroOrdre());

		if (doctorDTO.getIdSpecialite() != null) {
			DoctorSpeciality spec = specialityRepository.findById(doctorDTO.getIdSpecialite())
					.orElseThrow(() -> new ResourceNotFoundException(
							"Speciality not found with id: " + doctorDTO.getIdSpecialite()));
			doctor.setSpecialite(spec);
		}

		doctor.setIdService(doctorDTO.getIdService());
		Doctor saved = doctorRepository.save(doctor);
		return mapToDTO(saved);
	}

	public DoctorDTO filterSensitiveInfo(DoctorDTO dto) {
		dto.setIdUser(null);
		dto.setCreatedAt(null);
		dto.setUpdatedAt(null);
		return dto;
	}

	@Transactional
	public void deleteDoctor(Long idDoctor) {
		Doctor doctor = doctorRepository.findById(idDoctor)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
		
		try {
			java.util.Map<String, Object> request = new java.util.HashMap<>();
			request.put("statut", false);
			authClient.updateUser(doctor.getIdUser(), request);
            
            doctorRepository.delete(doctor);
		} catch (Exception e) {
			log.error("Failed to update user status in auth-service for userId: " + doctor.getIdUser(), e);
			throw new RuntimeException("Erreur lors de la désactivation (Update statut a échoué)");
		}
	}

	public List<Object> getAppointmentsByDoctor(Long idDoctor) {
		return extractAppointments(appointmentClient.getAppointmentsByDoctor(idDoctor));
	}

	@SuppressWarnings("unchecked")
	private List<Object> extractAppointments(Object response) {
		if (response == null)
			return List.of();
		if (response instanceof List)
			return (List<Object>) response;
		if (response instanceof java.util.Map) {
			java.util.Map<String, Object> map = (java.util.Map<String, Object>) response;
			if (map.containsKey("hydra:member") && map.get("hydra:member") instanceof List) {
				return (List<Object>) map.get("hydra:member");
			}
			if (map.containsKey("member") && map.get("member") instanceof List) {
				return (List<Object>) map.get("member");
			}
			if (map.containsKey("data") && map.get("data") instanceof List) {
				return (List<Object>) map.get("data");
			}
		}
		return List.of();
	}

	@SuppressWarnings("unchecked")
	public List<PatientDTO> getMyPatients(Long idDoctor, String authHeader) {
		List<Object> appointments = extractAppointments(appointmentClient.getAppointmentsByDoctor(idDoctor));

		// Fallback logic because rdv-service (PHP) might store either id_docteur (PK) or id_user (Auth ID)
		if (appointments == null || appointments.isEmpty()) {
			log.warn("No appointments found for idDoctor {}. Checking doctor profile for fallback...", idDoctor);
			Doctor doctor = doctorRepository.findById(idDoctor).orElse(null);
			if (doctor != null && doctor.getIdUser() != null && !doctor.getIdUser().equals(idDoctor)) {
				log.info("Trying fallback with idUser {} for doctor {}.", doctor.getIdUser(), idDoctor);
				List<Object> fallbackApps = extractAppointments(appointmentClient.getAppointmentsByDoctor(doctor.getIdUser()));
				if (fallbackApps != null && !fallbackApps.isEmpty()) {
					log.info("Found {} appointments using idUser fallback.", fallbackApps.size());
					appointments = fallbackApps;
				} else {
					log.warn("No appointments found even with idUser fallback.");
				}
			} else {
				log.warn("Doctor profile not found or idUser matches idDoctor. No fallback possible.");
			}
		} else {
			log.info("Found {} appointments for idDoctor {}.", appointments.size(), idDoctor);
		}

		if (appointments == null || appointments.isEmpty()) {
			return List.of();
		}

		// Debug: show keys of the first appointment map to verify id_patient mapping
		if (!appointments.isEmpty() && appointments.get(0) instanceof java.util.Map) {
			java.util.Map<String, Object> first = (java.util.Map<String, Object>) appointments.get(0);
			log.info("Appointment keys found: {}", first.keySet());
		}

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
				.map(id -> {
					try {
						return Long.valueOf(id.toString());
					} catch (NumberFormatException e) {
						return null;
					}
				})
				.filter(java.util.Objects::nonNull)
				.distinct()
				.map(patientId -> {
					log.debug("Fetching patient details for ID: {}", patientId);
					try {
						Object rawResponse = patientClient.getPatientById(patientId, authHeader);
						if (rawResponse instanceof ApiResponse<?> response) {
							Object data = response.getData();
							if (data == null) {
								log.warn("Patient details missing in response for ID: {}", patientId);
								return null;
							}
							
							// If it's already a PatientDTO (lucky case)
							if (data instanceof PatientDTO) {
								return (PatientDTO) data;
							}
							
							// If it's a Map (Jackson generic fallback), we need to extract fields.
							// This is likely why we have 500 errors (ClassCastException).
							if (data instanceof java.util.Map) {
								java.util.Map<String, Object> mapData = (java.util.Map<String, Object>) data;
								PatientDTO p = new PatientDTO();
								p.setIdPatient(mapData.get("idPatient") != null ? Long.valueOf(mapData.get("idPatient").toString()) : null);
								p.setIdUser(mapData.get("idUser") != null ? Long.valueOf(mapData.get("idUser").toString()) : null);
								p.setNumDossier((String) mapData.get("numDossier"));
								p.setAssurance((String) mapData.get("assurance"));
								p.setNumeroAssurance((String) mapData.get("numeroAssurance"));
								p.setStatut(mapData.get("statut") instanceof Boolean ? (Boolean) mapData.get("statut") : (mapData.get("statut") != null && mapData.get("statut").toString().equalsIgnoreCase("true")));

								// Extract userInfo if present, OR map from flat fields (Patient-Service format)
								com.ShifaTech.DoctorService.dto.UserDTO u = new com.ShifaTech.DoctorService.dto.UserDTO();
								if (mapData.get("userInfo") instanceof java.util.Map) {
									java.util.Map<String, Object> uMap = (java.util.Map<String, Object>) mapData.get("userInfo");
									u.setNom((String) uMap.get("nom"));
									u.setPrenom((String) uMap.get("prenom"));
									u.setSexe((String) uMap.get("sexe"));
									u.setEmail((String) uMap.get("email"));
									u.setTelephone((String) uMap.get("telephone"));
									u.setAdresse((String) uMap.get("adresse"));
									u.setCin((String) uMap.get("cin"));
									u.setStatut(uMap.get("statut") instanceof Boolean ? (Boolean) uMap.get("statut") : (uMap.get("statut") != null && uMap.get("statut").toString().equalsIgnoreCase("true")));
									u.setDateNaissance((String) uMap.get("dateNaissance"));
								} else {
									// Fallback to flat structure
									u.setNom((String) mapData.get("nom"));
									u.setPrenom((String) mapData.get("prenom"));
									u.setSexe((String) mapData.get("sexe"));
									u.setEmail((String) mapData.get("email"));
									u.setTelephone((String) mapData.get("telephone"));
									u.setAdresse((String) mapData.get("adresse"));
									u.setCin((String) mapData.get("cin"));
									u.setStatut(mapData.get("statut") instanceof Boolean ? (Boolean) mapData.get("statut") : (mapData.get("statut") != null && mapData.get("statut").toString().equalsIgnoreCase("true")));
									u.setDateNaissance((String) mapData.get("dateNaissance"));
								}
								p.setUserInfo(u);
								return p;
							}
						}
						log.warn("Unexpected response format from patient-service for ID: {}", patientId);
						return null;
					} catch (Exception e) {
						log.error("Failed to fetch patient info for ID: " + patientId + ". Error: " + e.getMessage(), e);
						return null;
					}
				})
				.filter(java.util.Objects::nonNull)
				.collect(Collectors.toList());
	}

	public List<Object> getMyVisits(Long idDoctor, String authHeader) {
		log.info("Fetching proxy visits for doctor ID: {}", idDoctor);
		List<PatientDTO> myPatients = getMyPatients(idDoctor, authHeader);
		java.util.Set<Long> myPatientIds = myPatients.stream()
				.map(PatientDTO::getIdPatient)
				.filter(java.util.Objects::nonNull)
				.collect(Collectors.toSet());

		ApiResponse<List<Object>> response = patientClient.getAllVisites(authHeader);
		if (response == null || !response.isSuccess() || response.getData() == null) {
			return List.of();
		}

		return response.getData().stream()
				.filter(obj -> obj instanceof java.util.Map)
				.map(obj -> (java.util.Map<String, Object>) obj)
				.filter(map -> {
					Object visitDocId = map.get("idDoctor");
					if (visitDocId == null)
						visitDocId = map.get("id_doctor");

					Object visitPatId = map.get("idDossierPatient");
					if (visitPatId == null)
						visitPatId = map.get("idPatient");
					if (visitPatId == null)
						visitPatId = map.get("id_patient");

					boolean isMyDoctorId = visitDocId != null && Long.valueOf(visitDocId.toString()).equals(idDoctor);
					boolean isMyPatient = visitPatId != null && myPatientIds.contains(Long.valueOf(visitPatId.toString()));

					return isMyDoctorId || isMyPatient;
				})
				.collect(Collectors.toList());
	}

	public List<Object> getMyDossiers(Long idDoctor, String authHeader) {
		log.info("Fetching proxy medical records for doctor ID: {}", idDoctor);
		List<PatientDTO> myPatients = getMyPatients(idDoctor, authHeader);
		java.util.Set<Long> myPatientIds = myPatients.stream()
				.map(PatientDTO::getIdPatient)
				.filter(java.util.Objects::nonNull)
				.collect(Collectors.toSet());

		ApiResponse<List<Object>> response = patientClient.getAllDossiers(authHeader);
		if (response == null || !response.isSuccess() || response.getData() == null) {
			return List.of();
		}

		return response.getData().stream()
				.filter(obj -> obj instanceof java.util.Map)
				.map(obj -> (java.util.Map<String, Object>) obj)
				.filter(map -> {
					Object dossierPatId = map.get("idPatient");
					if (dossierPatId == null)
						dossierPatId = map.get("id_patient");

					return dossierPatId != null && myPatientIds.contains(Long.valueOf(dossierPatId.toString()));
				})
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
				dto.setCin((String) user.get("cin"));
				dto.setTelephone((String) user.get("telephone"));
				dto.setAdresse((String) user.get("adresse"));
				dto.setDateNaissance((String) user.get("dateNaissance"));
			}
		} catch (Exception e) {
			log.error("Failed to fetch user info from auth-service for userId: " + doctor.getIdUser(), e);
		}

		return dto;
	}
}