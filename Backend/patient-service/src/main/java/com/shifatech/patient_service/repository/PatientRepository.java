package com.shifatech.patient_service.repository;

import com.shifatech.patient_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByIdUser(Long idUser);

    Optional<Patient> findByNumDossier(String numDossier);

    boolean existsByIdUser(Long idUser);

    boolean existsByNumDossier(String numDossier);

    // Récupérer tous les patients actifs (soft delete)
    @Query("SELECT p FROM Patient p WHERE p.deletedAt IS NULL")
    List<Patient> findAllActive();

    // Récupérer un patient actif par ID
    @Query("SELECT p FROM Patient p WHERE p.idPatient = :id AND p.deletedAt IS NULL")
    Optional<Patient> findActiveById(Long id);

    // Rechercher des patients par nom (nécessite join avec service Auth)
    List<Patient> findByStatut(Boolean statut);
}