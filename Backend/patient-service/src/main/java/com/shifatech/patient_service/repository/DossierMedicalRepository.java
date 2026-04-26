package com.shifatech.patient_service.repository;

import com.shifatech.patient_service.entity.DossierMedical;
import com.shifatech.patient_service.entity.DossierMedical.StatusDossier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, Long> {

    Optional<DossierMedical> findByIdPatient(Long idPatient);

    Optional<DossierMedical> findByIdPatientAndStatus(Long idPatient, StatusDossier status);

    List<DossierMedical> findByStatus(StatusDossier status);

    @Query("SELECT d FROM DossierMedical d WHERE d.idPatient = :idPatient AND d.deletedAt IS NULL AND d.idPatient IN (SELECT p.idPatient FROM Patient p WHERE p.deletedAt IS NULL)")
    List<DossierMedical> findActiveByIdPatient(Long idPatient);

    @Query("SELECT d FROM DossierMedical d WHERE d.deletedAt IS NULL AND d.idPatient IN (SELECT p.idPatient FROM Patient p WHERE p.deletedAt IS NULL)")
    List<DossierMedical> findByDeletedAtIsNull();

    boolean existsByIdPatient(Long idPatient);
}