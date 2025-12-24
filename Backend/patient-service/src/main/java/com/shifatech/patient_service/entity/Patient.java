package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_patient")
    private Long idPatient;

    @Column(name = "id_user", unique = true)
    private Long idUser; // Référence vers le service Auth

    @Column(name = "num_dossier", unique = true)
    private String numDossier;

    private Double poids;
    private Double taille;

    // Relations
    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private DossierMedical dossierMedical;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Ordonnance> ordonnances = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Affiche> affiches = new ArrayList<>();
}