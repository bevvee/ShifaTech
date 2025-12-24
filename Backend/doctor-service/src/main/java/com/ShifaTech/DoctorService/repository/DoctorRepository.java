package com.ShifaTech.DoctorService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ShifaTech.DoctorService.entity.Doctor;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // Méthode personnalisée : trouver un docteur par nom
    Optional<Doctor> findByName(String name);

    // Méthode personnalisée : trouver tous les docteurs dont le nom contient une chaîne
    List<Doctor> findByNameContainingIgnoreCase(String name);

    // Méthode personnalisée : vérifier si un docteur existe par nom
    boolean existsByName(String name);
}