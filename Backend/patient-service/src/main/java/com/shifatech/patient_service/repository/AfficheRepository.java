package com.shifatech.patient_service.repository;

import com.shifatech.patient_service.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AfficheRepository extends JpaRepository<Affiche, Long> {
    List<Affiche> findByIdPatientOrderByDateCreationDesc(Long idPatient);
    List<Affiche> findByIdDocteur(Long idDocteur);
    List<Affiche> findAllByOrderByDateCreationDesc();
    long countByIdPatient(Long idPatient);
}