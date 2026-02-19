package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonBackReference;
=======
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)
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

<<<<<<< HEAD
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
=======
    @Column(name = "poids", precision = 5, scale = 2)
    private BigDecimal poids;

    @Column(name = "taille", precision = 5, scale = 2)
    private BigDecimal taille;

    @Column(name = "groupe_sanguin", length = 5)
    private String groupeSanguin;

    @Column(name = "antecedents_medicaux", columnDefinition = "TEXT")
    private String antecedentsMedicaux;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "pathologies_chroniques", columnDefinition = "TEXT")
    private String pathologiesChroniques;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "diagnostic", columnDefinition = "TEXT")
    private String diagnostic;
>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)

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