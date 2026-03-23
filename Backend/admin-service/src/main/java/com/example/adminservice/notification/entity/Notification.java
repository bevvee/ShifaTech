package com.example.adminservice.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idNotif")
    private Integer idNotif;

    @Enumerated(EnumType.STRING)
    @Column(name = "typeNotif", length = 50, nullable = false)
    private TypeNotif typeNotif;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "datePlanifiee")
    private LocalDateTime datePlanifiee;   // quand envoyer

    @Column(name = "dateEnvoi")
    private LocalDateTime dateEnvoi;       // quand réellement envoyé

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 20, nullable = false)
    @Builder.Default
    private StatutNotif statut = StatutNotif.PLANIFIE;

    @Column(name = "id_user", nullable = false)
    private Integer idUser;

    @Column(name = "emailDestinataire")
    private String emailDestinataire;
}
