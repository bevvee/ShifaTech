package com.ShifaTech.DoctorService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "DOCTEUR")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
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

    @Column(name = "id_service")
    private Long idService;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
