package com.ShifaTech.DoctorService.repository;

import com.ShifaTech.DoctorService.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    java.util.List<Doctor> findByIdUser(Long idUser);

    java.util.List<Doctor> findByNumeroOrdre(String numeroOrdre);
}