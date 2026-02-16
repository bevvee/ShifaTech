package com.shifatech.patient_service.repository;

import com.shifatech.patient_service.entity.Visite;
import com.shifatech.patient_service.entity.Visite.StatusVisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisiteRepository extends JpaRepository<Visite, Long> {

    List<Visite> findByIdDossier(Long idDossier);

    List<Visite> findByIdDoctor(Long idDoctor);

    List<Visite> findByStatus(StatusVisite status);

    @Query("SELECT v FROM Visite v WHERE v.idDossier = :idDossier ORDER BY v.dateCreation DESC")
    List<Visite> findByIdDossierOrderByDateDesc(Long idDossier);

    @Query("SELECT v FROM Visite v WHERE v.idDoctor = :idDoctor AND v.status = :status")
    List<Visite> findByIdDoctorAndStatus(Long idDoctor, StatusVisite status);
}