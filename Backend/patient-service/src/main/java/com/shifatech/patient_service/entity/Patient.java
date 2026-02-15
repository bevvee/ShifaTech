package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_patient")
    private Long idPatient;

    @Column(name = "id_user", nullable = false, unique = true)
    private Long idUser; // Référence vers le service Auth

    @Column(name = "num_dossier", unique = true, length = 50)
    private String numDossier;

    @Column(name = "poids", precision = 5, scale = 2)
    private BigDecimal poids;

    @Column(name = "taille", precision = 5, scale = 2)
    private BigDecimal taille;

    @Column(name = "groupe_sanguin", length = 5)
    private String groupeSanguin; // Ex: A+, O-, AB+

    @Column(name = "antecedents_medicaux", columnDefinition = "TEXT")
    private String antecedentsMedicaux;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "pathologies_chroniques", columnDefinition = "TEXT")
    private String pathologiesChroniques;

    @Column(name = "assurance", length = 100)
    private String assurance;

    @Column(name = "numero_assurance", length = 50)
    private String numeroAssurance;

    @Column(name = "contact_urgence_nom", length = 100)
    private String contactUrgenceNom;

    @Column(name = "contact_urgence_tel", length = 20)
    private String contactUrgenceTel;

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
}