package com.example.adminservice.controller;

import com.example.adminservice.dto.EventRequestDTO;
import com.example.adminservice.dto.NotificationDTO;
import com.example.adminservice.service.EventService;
import com.example.adminservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    private final NotificationService notificationService;
    private final EventService        eventService;
    @PostMapping({"/notifications/events", "/admin/events"})
    public ResponseEntity<Void> receiveEvent(@RequestBody EventRequestDTO dto) {
        if (dto.getStatut() == null || dto.getIdRdv() == null) return ResponseEntity.badRequest().build();
        
        String statut  = dto.getStatut().trim().toUpperCase();
        String dateRdv = (dto.getDateRdv() != null && !dto.getDateRdv().isBlank()) ? dto.getDateRdv().trim() : "N/A";

        log.info("[NotificationController] Evénement reçu : {} pour RDV#{}", statut, dto.getIdRdv());

        switch (statut) {
            case "CONFIRME" -> eventService.handleConfirmation(dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);
            case "CREATED", "EN_ATTENTE" -> eventService.handleNouveauRdv(dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv, statut);
            case "MODIFIE" -> eventService.handleModification(dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);
            case "ANNULE" -> eventService.handleAnnulation(dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);
            default -> { return ResponseEntity.accepted().build(); }
        }
        return ResponseEntity.accepted().build();
    }

    @PostMapping({"/notifications/planning-events", "/admin/planning-events"})
    public ResponseEntity<Void> receivePlanningEvent(@RequestBody EventRequestDTO dto) {
        if (dto.getIdDocteur() == null) return ResponseEntity.badRequest().build();
        String dateRdv = (dto.getDateRdv() != null && !dto.getDateRdv().isBlank()) ? dto.getDateRdv().trim() : "N/A";
        
        log.info("[NotificationController] Planning modifié pour docteur#{}", dto.getIdDocteur());
        
        eventService.handlePlanningModification(dto.getIdDocteur(), dateRdv, dto.getStatut());
        return ResponseEntity.accepted().build();
    }


    @GetMapping("/notifications/user/{idUser}")
    public ResponseEntity<List<NotificationDTO>> getByUser(@PathVariable Integer idUser) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(idUser));
    }

    @GetMapping("/notifications/user/{idUser}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadByUser(@PathVariable Integer idUser) {
        return ResponseEntity.ok(notificationService.getUnreadByUser(idUser));
    }

    @PutMapping("/notifications/user/{idUser}/mark-read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Integer idUser) {
        notificationService.markAllAsRead(idUser);
        return ResponseEntity.ok().build();
    }



}
