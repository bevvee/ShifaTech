package com.shifatech.patient_service.repository;

import com.shifatech.patient_service.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {
    List<Ordonnance> findByIdPatient(Long idPatient);
    List<Ordonnance> findByIdPatientOrderByDateCreationDesc(Long idPatient);
    List<Ordonnance> findByIdDocteur(Long idDocteur);
    long countByIdPatient(Long idPatient);
}