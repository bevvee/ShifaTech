package com.ShifaTech.DoctorService.repository;

import com.ShifaTech.DoctorService.entity.Planning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanningRepository extends JpaRepository<Planning, Long> {
    List<Planning> findByDoctorIdDocteur(Long idDoctor);
}
