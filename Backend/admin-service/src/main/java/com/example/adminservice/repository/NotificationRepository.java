package com.example.adminservice.repository;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByIdUserOrderByDateEnvoiDesc(Integer idUser);

    List<Notification> findByIdUserAndEstLuFalseOrderByDateEnvoiDesc(Integer idUser);

    boolean existsByIdUserAndMessageContaining(Integer idUser, String messageFragment);

    boolean existsByIdUserAndMessage(Integer idUser, String message);

    boolean existsByMessageContaining(String message);

}