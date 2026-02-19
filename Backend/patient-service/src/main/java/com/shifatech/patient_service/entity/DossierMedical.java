package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dossier_medical")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dossier")
    private Long idDossier;

    @Column(name = "id_patient", nullable = false)
    private Long idPatient;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private StatusDossier status = StatusDossier.ACTIVE;

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

    @Column(name = "date_fermeture")
    private LocalDateTime dateFermeture;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum StatusDossier {
        ACTIVE,
        ARCHIVED,
        DECEASED
    }
}