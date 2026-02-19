package com.ShifaTech.DoctorService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "DOCTOR_SPECIALITE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSpeciality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_specialite")
    private Long idSpecialite;

    @Column(name = "label", length = 50)
    private String label;
}
