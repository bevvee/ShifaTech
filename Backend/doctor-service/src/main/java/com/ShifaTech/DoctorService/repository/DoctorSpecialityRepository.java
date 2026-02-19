package com.ShifaTech.DoctorService.repository;

import com.ShifaTech.DoctorService.entity.DoctorSpeciality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorSpecialityRepository extends JpaRepository<DoctorSpeciality, Long> {
}
