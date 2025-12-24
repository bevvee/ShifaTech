package com.ShifaTech.DoctorService.service;

import com.ShifaTech.DoctorService.entity.Doctor;
import com.ShifaTech.DoctorService.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DoctorService {

	private final DoctorRepository doctorRepository;

	public DoctorService(DoctorRepository doctorRepository) {
		this.doctorRepository = doctorRepository;
	}

	// Récupérer tous les docteurs
	public List<Doctor> getAllDoctors() {
		return doctorRepository.findAll();
	}

	// Récupérer un docteur par ID
	public Doctor getDoctorById(Long id) {
		return doctorRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Docteur non trouvé avec l'id: " + id));
	}

	// Créer un nouveau docteur
	public Doctor createDoctor(Doctor doctor) {
		// Vérifier si un docteur avec ce nom existe déjà
		if (doctorRepository.existsByName(doctor.getName())) {
			throw new RuntimeException("Un docteur avec ce nom existe déjà: " + doctor.getName());
		}
		return doctorRepository.save(doctor);
	}

	// Mettre à jour un docteur
	public Doctor updateDoctor(Long id, Doctor doctorDetails) {
		Doctor doctor = getDoctorById(id);
		doctor.setName(doctorDetails.getName());
		return doctorRepository.save(doctor);
	}

	// Supprimer un docteur
	public void deleteDoctor(Long id) {
		if (!doctorRepository.existsById(id)) {
			throw new RuntimeException("Docteur non trouvé avec l'id: " + id);
		}
		doctorRepository.deleteById(id);
	}

	// Compter le nombre de docteurs
	public long countDoctors() {
		return doctorRepository.count();
	}

	// Rechercher des docteurs par nom
	public List<Doctor> searchDoctorsByName(String name) {
		return doctorRepository.findByNameContainingIgnoreCase(name);
	}

	// Trouver un docteur par nom exact
	public Doctor findByName(String name) {
		return doctorRepository.findByName(name)
				.orElseThrow(() -> new RuntimeException("Docteur non trouvé avec le nom: " + name));
	}
}