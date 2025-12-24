package com.shifatech.patient_service.repository;

import com.shifatech.patient_service.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByIdUser(Long idUser);
    boolean existsByIdUser(Long idUser);
    Optional<Patient> findByNumDossier(String numDossier);
}