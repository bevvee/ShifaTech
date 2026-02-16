package com.shifatech.patient_service.repository;

import com.shifatech.patient_service.entity.Ordonnance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {

    List<Ordonnance> findByIdPatient(Long idPatient);

    List<Ordonnance> findByIdDoctor(Long idDoctor);

    List<Ordonnance> findByIdVisite(Long idVisite);

    List<Ordonnance> findByStatut(Boolean statut);

    @Query("SELECT o FROM Ordonnance o WHERE o.idPatient = :idPatient ORDER BY o.dateCreation DESC")
    List<Ordonnance> findByIdPatientOrderByDateDesc(Long idPatient);

    @Query("SELECT o FROM Ordonnance o WHERE o.dateValidite < :now AND o.statut = true")
    List<Ordonnance> findExpiredOrdonnances(LocalDateTime now);
}