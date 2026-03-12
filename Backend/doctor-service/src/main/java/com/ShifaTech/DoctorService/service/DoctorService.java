package com.ShifaTech.DoctorService.service;

import com.ShifaTech.DoctorService.client.AppointmentClient;
import com.ShifaTech.DoctorService.dto.DoctorDTO;
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

	/**
	 * Get aggregated Doctor Profile (Local only, as per independence rule)
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
		if (!doctorRepository.existsById(idDoctor)) {
			throw new ResourceNotFoundException("Doctor not found");
		}
		doctorRepository.deleteById(idDoctor);
	}

	public List<Object> getAppointmentsByDoctor(Long idDoctor) {
		return appointmentClient.getAppointmentsByDoctor(idDoctor);
	}

	// Helper mapper
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

		return dto;
	}
}