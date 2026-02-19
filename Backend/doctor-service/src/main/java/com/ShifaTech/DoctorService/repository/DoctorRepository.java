package com.ShifaTech.DoctorService.repository;

import com.ShifaTech.DoctorService.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByIdUser(Long idUser);

    Optional<Doctor> findByNumeroOrdre(String numeroOrdre);
}