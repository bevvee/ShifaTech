package com.example.adminservice.dto;

import com.example.adminservice.Enum.TypeNotif;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Objet envoyé sur le canal WebSocket /topic/notifications/{idUser}.
 *
 * Structure JSON standardisée :
 * {
 *   "idNotif"    : 42,
 *   "typeNotif"  : "CONFIRMATION",
 *   "titre"      : "Rendez-vous confirmé",
 *   "idRessource": 123,
 *   "message"    : "Votre rendez-vous est confirmé le 2025-06-10",
 *   "dateEnvoi"  : "2025-06-09T08:30:00",
 *   "estLu"      : false
 * }
 */
@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationPayload {

    Integer idNotif;
    TypeNotif typeNotif;
    String titre;
    Integer idRessource;
    String message;
    LocalDateTime dateEnvoi;
    boolean estLu;
}
