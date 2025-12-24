package com.shifatech.patient_service.repository;

import com.shifatech.patient_service.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, Long> {
    Optional<DossierMedical> findByIdPatient(Long idPatient);
    boolean existsByIdPatient(Long idPatient);
    List<DossierMedical> findByIdDocteur(Long idDocteur);
}
