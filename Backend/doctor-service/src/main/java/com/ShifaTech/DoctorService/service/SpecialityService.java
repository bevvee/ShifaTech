package com.ShifaTech.DoctorService.service;

import com.ShifaTech.DoctorService.dto.DoctorSpecialityDTO;
import com.ShifaTech.DoctorService.entity.DoctorSpeciality;
import com.ShifaTech.DoctorService.repository.DoctorSpecialityRepository;
import com.ShifaTech.DoctorService.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialityService {

    private final DoctorSpecialityRepository specialityRepository;

    public List<DoctorSpecialityDTO> getAllSpecialities() {
        return specialityRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DoctorSpecialityDTO getSpecialityById(Long id) {
        return specialityRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Speciality not found with id: " + id));
    }

    @Transactional
    public DoctorSpecialityDTO createSpeciality(DoctorSpecialityDTO dto) {
        DoctorSpeciality speciality = new DoctorSpeciality();
        speciality.setLabel(dto.getLabel());
        return mapToDTO(specialityRepository.save(speciality));
    }

    @Transactional
    public DoctorSpecialityDTO updateSpeciality(Long id, DoctorSpecialityDTO dto) {
        DoctorSpeciality speciality = specialityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Speciality not found with id: " + id));

        if (dto.getLabel() != null) {
            speciality.setLabel(dto.getLabel());
        }

        return mapToDTO(specialityRepository.save(speciality));
    }

    @Transactional
    public void deleteSpeciality(Long id) {
        if (!specialityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Speciality not found with id: " + id);
        }
        specialityRepository.deleteById(id);
    }

    private DoctorSpecialityDTO mapToDTO(DoctorSpeciality speciality) {
        return new DoctorSpecialityDTO(
                speciality.getIdSpecialite(),
                speciality.getLabel(),
                speciality.getCreatedAt());
    }
}
