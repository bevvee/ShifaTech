package com.example.adminservice.dto;

import com.example.adminservice.Enum.TypeNotif;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDTO {
    private Integer idNotif;
    private TypeNotif typeNotif;
    private String message;
    private LocalDateTime dateEnvoi;
    private Integer idUser;
    private boolean lu;
}
