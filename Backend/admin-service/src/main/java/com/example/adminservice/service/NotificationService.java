package com.example.adminservice.service;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.dto.NotificationDTO;
import com.example.adminservice.dto.NotificationPayload;
import com.example.adminservice.notification.entity.Notification;
import com.example.adminservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationWebSocketService webSocketService;

    public List<NotificationDTO> getNotificationsByUser(Integer idUser) {
        return notificationRepository
                .findByIdUserOrderByDateEnvoiDesc(idUser)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void createNotification(Integer idUser, TypeNotif type, String message) {
        createNotification(idUser, type, message, null);
    }
    @Transactional
    public void createNotification(Integer idUser, TypeNotif type, String message, Integer idRessource) {
        if (notificationRepository.existsByIdUserAndMessage(idUser, message)) {
            return;
        }

        Notification notif = Notification.builder()
                .idUser(idUser)
                .typeNotif(type)
                .message(message)
                .dateEnvoi(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notif);
        webSocketService.sendToUser(idUser, buildPayload(saved, idRessource));
    }
    public boolean alreadyNotified(Integer idUser, String messageFragment) {
        return notificationRepository.existsByIdUserAndMessageContaining(idUser, messageFragment);
    }
    public boolean markerExists(String marker) {
        return notificationRepository.existsByMessageContaining(marker);
    }

    @Transactional
    public void markAllAsRead(Integer idUser) {
        List<Notification> notifications = notificationRepository.findByIdUserOrderByDateEnvoiDesc(idUser);
        notifications.forEach(notif -> notif.setEstLu(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationDTO mapToDTO(Notification notif) {
        return NotificationDTO.builder()
                .idNotif(notif.getIdNotif())
                .typeNotif(notif.getTypeNotif())
                .titre(getTitre(notif.getTypeNotif()))
                .message(notif.getMessage())
                .dateEnvoi(notif.getDateEnvoi())
                .idUser(notif.getIdUser())
                .estLu(notif.isEstLu())
                .build();
    }

    private NotificationPayload buildPayload(Notification notif, Integer idRessource) {
        return NotificationPayload.builder()
                .idNotif(notif.getIdNotif())
                .typeNotif(notif.getTypeNotif())
                .titre(getTitre(notif.getTypeNotif()))
                .idRessource(idRessource)
                .message(notif.getMessage())
                .dateEnvoi(notif.getDateEnvoi())
                .estLu(notif.isEstLu())
                .build();
    }

    private static String getTitre(TypeNotif type) {
        return switch (type) {
            case RAPPEL       -> "Rappel de rendez-vous";
            case RDV          -> "Nouveau rendez-vous";
            case INFO         -> "Information";
            case CONFIRMATION -> "Rendez-vous confirmé";
            case MODIFICATION -> "Rendez-vous modifié";
        };
    }
}
