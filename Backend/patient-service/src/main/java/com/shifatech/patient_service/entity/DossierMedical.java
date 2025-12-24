package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDateTime;

@Entity
@Table(name = "dossiers_medicaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dossier")
    private Long idDossier;

    @Column(name = "id_patient")
    private Long idPatient;

    @Column(name = "id_docteur")
    private Long idDocteur;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_fermeture")
    private LocalDateTime dateFermeture;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String diagnostic;

    @Column(name = "id_ordonnance")
    private Long idOrdonnance; // Référence à l'ordonnance associée

    @OneToOne
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    @JsonBackReference
    private Patient patient;
}