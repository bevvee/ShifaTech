package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDateTime;

@Entity
@Table(name = "affiches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Affiche {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_affiche")
    private Long idAffiche;

    @Column(name = "id_patient")
    private Long idPatient;

    @Column(name = "id_docteur")
    private Long idDocteur;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    private String titre;

    @ManyToOne
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    @JsonBackReference
    private Patient patient;
}