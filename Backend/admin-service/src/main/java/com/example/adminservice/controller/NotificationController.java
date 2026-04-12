package com.example.adminservice.controller;

import com.example.adminservice.client.ApiClient;
import com.example.adminservice.dto.EventRequestDTO;
import com.example.adminservice.dto.NotificationDTO;
import com.example.adminservice.service.EmailService;
import com.example.adminservice.service.EventService;
import com.example.adminservice.service.NotificationService;
import com.example.adminservice.scheduler.RdvScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final RdvScheduler rdvScheduler;
    private final ApiClient apiClient;
    private final EmailService emailService;
    private final EventService eventService; // ← ajouté

    @GetMapping("/user/{idUser}")
    public ResponseEntity<List<NotificationDTO>> getByUser(@PathVariable Integer idUser) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(idUser));
    }

    @GetMapping("/patient/{idPatient}")
    public ResponseEntity<List<NotificationDTO>> getByPatient(@PathVariable Integer idPatient) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(idPatient));
    }

    @PutMapping("/user/{idUser}/mark-read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Integer idUser) {
        notificationService.markAllAsRead(idUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/trigger-scheduler")
    public ResponseEntity<String> triggerScheduler() {
        rdvScheduler.envoyerRappels24h();
        return ResponseEntity.ok("Scheduler exécuté");
    }

    // ← trigger manuel pour tester les annulations
    @PostMapping("/trigger-annulations")
    public ResponseEntity<String> triggerAnnulations() {
        rdvScheduler.detecterAnnulations();
        return ResponseEntity.ok("Détection annulations exécutée");
    }

    // ← simplifié, délègue à EventService
    @PostMapping("/event")
    public ResponseEntity<String> handleEvent(@RequestBody EventRequestDTO event) {
        eventService.handleAnnulation(
            event.getIdRdv(),
            event.getIdPatient(),
            event.getIdDocteur(),
            event.getDateRdv()
        );
        return ResponseEntity.ok("Event traité !");
    }
}