package com.example.adminservice.service;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.dto.NotificationDTO;
import com.example.adminservice.notification.entity.Notification;
import com.example.adminservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDTO> getNotificationsByUser(Integer idUser) {
        return notificationRepository.findByIdUserOrderByDateEnvoiDesc(idUser)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void createNotification(Integer idUser, TypeNotif type, String message) {
        // Anti-doublon basé sur le message COMPLET (pas substring)
        if (notificationRepository.existsByIdUserAndMessage(idUser, message)) {
            return;
        }
        Notification notif = Notification.builder()
            .idUser(idUser)
            .typeNotif(type)
            .message(message)
            .dateEnvoi(LocalDateTime.now())
            .build();
        notificationRepository.save(notif);
    }

    public boolean alreadyNotified(Integer idUser, String messageFragment) {
        return notificationRepository.existsByIdUserAndMessageContaining(idUser, messageFragment);
    }

    private NotificationDTO mapToDTO(Notification notif) {
        return NotificationDTO.builder()
                .idNotif(notif.getIdNotif())
                .typeNotif(notif.getTypeNotif())
                .message(notif.getMessage())
                .dateEnvoi(notif.getDateEnvoi())
                .idUser(notif.getIdUser())
                .lu(notif.isLu())
                .build();
    }

    public void markAllAsRead(Integer idUser) {
        List<Notification> notifications = notificationRepository.findByIdUserOrderByDateEnvoiDesc(idUser);
        notifications.forEach(notif -> notif.setLu(true));
        notificationRepository.saveAll(notifications);
    }
}
