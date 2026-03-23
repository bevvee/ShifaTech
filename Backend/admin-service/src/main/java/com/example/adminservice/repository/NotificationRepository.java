package com.example.adminservice.repository;


import com.example.adminservice.notification.entity.Notification;
import com.example.adminservice.notification.entity.StatutNotif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Pour le scheduler : toutes les notifs planifiées dont la date est passée
    List<Notification> findByStatutAndDatePlanifieeBefore(
            StatutNotif statut,
            LocalDateTime now
    );

    // Historique par utilisateur
    List<Notification> findByIdUserOrderByDatePlanifieeDesc(Integer idUser);

    // Filtrer par type
    List<Notification> findByIdUserAndTypeNotif(
            Integer idUser,
            com.example.adminservice.notification.entity.TypeNotif typeNotif
    );
}
