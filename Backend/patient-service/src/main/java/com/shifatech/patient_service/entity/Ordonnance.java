package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ordonnance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ordonnance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ordonnance")
    private Long idOrdonnance;

    @Column(name = "id_patient", nullable = false)
    private Long idPatient;

    @Column(name = "id_doctor", nullable = false)
    private Long idDoctor; // Référence vers le service Doctor

    @Column(name = "id_visite")
    private Long idVisite; // Lien optionnel vers une visite

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "medicaments", columnDefinition = "TEXT", nullable = false)
    private String medicaments; // JSON ou texte formaté

    @Column(name = "posologie", columnDefinition = "TEXT")
    private String posologie;

    @Column(name = "duree_traitement", length = 50)
    private String dureeTraitement; // Ex: "7 jours", "2 semaines"

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "date_validite")
    private java.time.LocalDate dateValidite;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "statut", length = 20, nullable = false)
    private StatusOrdonnance statut = StatusOrdonnance.ACTIVE;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;
}