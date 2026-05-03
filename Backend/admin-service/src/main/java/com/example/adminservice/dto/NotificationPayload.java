package com.example.adminservice.dto;

import com.example.adminservice.Enum.TypeNotif;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

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
