package com.ShifaTech.DoctorService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "DOCTEUR")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_docteur")
    private Long idDocteur;

    @Column(name = "id_user", unique = true)
    private Long idUser; // FK towards Auth Service

    @Column(name = "numero_ordre", length = 50)
    private String numeroOrdre;

    @ManyToOne
    @JoinColumn(name = "id_specialite")
    private DoctorSpeciality specialite;
}
