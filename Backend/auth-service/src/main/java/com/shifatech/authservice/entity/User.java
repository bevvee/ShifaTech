package com.shifatech.authservice.entity;

import com.shifatech.authservice.Enum.RoleEnum;
import com.shifatech.authservice.Enum.SexeEnum;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "cin"),
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "telephone")
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Integer id_user;

    private String nom;
    private String prenom;

    @Column(nullable = false)
    private String cin;

    @Column(nullable = false)
    private String email;

    @Column(name = "mot_de_passe")
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    private RoleEnum role;

    @Enumerated(EnumType.STRING)
    private SexeEnum sexe;

    private Boolean statut = false;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(nullable = false)
    private String telephone;

    private String adresse;

    private LocalDateTime createdAt = LocalDateTime.now();
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
    private LocalDateTime deletedAt;
    private Integer deletedBy;

    public Integer getIdUser() {
        return id_user;
    }
}
