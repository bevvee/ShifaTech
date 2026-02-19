package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

<<<<<<< HEAD
import java.util.ArrayList;
import java.util.List;
=======
import java.time.LocalDateTime;
>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)

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

<<<<<<< HEAD
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
=======
    @Column(name = "assurance", length = 100)
    private String assurance;

    @Column(name = "numero_assurance", length = 50)
    private String numeroAssurance;

    @Column(name = "statut")
    private Boolean statut = true; // Actif/Inactif

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private Long createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;
>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)
}