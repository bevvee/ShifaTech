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

    /** Catégorie : RAPPEL | RDV | INFO | CONFIRMATION | MODIFICATION */
    TypeNotif typeNotif;

    /** Titre court affiché en en-tête de la notification. */
    String titre;

    /** ID de la ressource métier concernée (ex : idRdv). Null si non applicable. */
    Integer idRessource;

    String message;

    /** Instant de création — même nom que dans NotificationDTO pour cohérence frontend. */
    LocalDateTime dateEnvoi;

    boolean estLu;
}
