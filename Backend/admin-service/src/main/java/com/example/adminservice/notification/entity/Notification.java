package com.example.adminservice.notification.entity;

import com.example.adminservice.Enum.TypeNotif;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "dateEnvoi")
    private LocalDateTime dateEnvoi;

    @Column(name = "id_user", nullable = false)
    private Integer idUser;

    @Column(name = "emailDestinataire")
    private String emailDestinataire;

    @Builder.Default
    @Column(name = "est_lu")
    private boolean estLu = false;
}
