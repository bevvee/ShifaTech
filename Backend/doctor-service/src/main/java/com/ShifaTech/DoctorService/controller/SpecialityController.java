package com.ShifaTech.DoctorService.controller;

import com.ShifaTech.DoctorService.dto.DoctorSpecialityDTO;
import com.ShifaTech.DoctorService.service.SpecialityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/speciality")
@RequiredArgsConstructor
public class SpecialityController {

    private final SpecialityService specialityService;

    @GetMapping("/all")
    public ResponseEntity<List<DoctorSpecialityDTO>> getAllSpecialities() {
        return ResponseEntity.ok(specialityService.getAllSpecialities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorSpecialityDTO> getSpecialityById(@PathVariable Long id) {
        return ResponseEntity.ok(specialityService.getSpecialityById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorSpecialityDTO> createSpeciality(@RequestBody DoctorSpecialityDTO dto) {
        return ResponseEntity.ok(specialityService.createSpeciality(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorSpecialityDTO> updateSpeciality(@PathVariable Long id,
            @RequestBody DoctorSpecialityDTO dto) {
        return ResponseEntity.ok(specialityService.updateSpeciality(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSpeciality(@PathVariable Long id) {
        specialityService.deleteSpeciality(id);
        return ResponseEntity.noContent().build();
    }
}
