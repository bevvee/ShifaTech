package com.shifatech.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "visite")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_visite")
    private Long idVisite;

    @Column(name = "id_doctor", nullable = false)
    private Long idDoctor; // Référence vers le service Doctor

    @Column(name = "id_dossier", nullable = false)
    private Long idDossier;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private StatusVisite status = StatusVisite.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_visite", length = 20)
    private TypeVisite typeVisite;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_blessure", length = 20)
    private TypeBlessure typeBlessure;

    @Column(name = "id_body_part")
    private Long idBodyPart;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "plan_traitement", columnDefinition = "TEXT", nullable = false)
    private String planTraitement;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "date_fermeture")
    private LocalDateTime dateFermeture;

    @Column(name = "overlay_url", columnDefinition = "TEXT")
    private String overlayUrl;

    @Column(name = "mask_url", columnDefinition = "TEXT")
    private String maskUrl;

    @Column(name = "original_image_url", columnDefinition = "TEXT")
    private String originalImageUrl;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public enum StatusVisite {
        OPEN,
        CLOSED,
        CANCELLED
    }
}