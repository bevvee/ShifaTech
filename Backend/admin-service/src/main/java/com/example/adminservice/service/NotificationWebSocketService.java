package com.example.adminservice.service;

import com.example.adminservice.dto.NotificationPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendToUser(Integer idUser, NotificationPayload payload) {
        String destination = "/topic/notifications/" + idUser;
        messagingTemplate.convertAndSend(destination, payload);
        log.info("[WS] → userId={} type={} idRessource={}", idUser, payload.getTypeNotif(), payload.getIdRessource());
    }
}
