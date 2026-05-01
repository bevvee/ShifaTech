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
    private final EventService eventService; 

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

    @PostMapping("/trigger-changements")
    public ResponseEntity<String> triggerChangements() {
        rdvScheduler.detecterChangementsStatuts();
        return ResponseEntity.ok("Détection changements de statut exécutée");
    }

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

    @GetMapping("/test-user-email/{userId}")
    public ResponseEntity<String> testUserEmail(@PathVariable Integer userId) {
        String token = apiClient.fetchJwtToken();
        if (token == null) return ResponseEntity.ok("Token NULL !");
        String email = apiClient.getUserEmail(userId, token);
        return ResponseEntity.ok("Email : " + (email != null ? email : "NULL"));
    }

    @GetMapping("/test-send-email")
    public ResponseEntity<String> testSendEmail(
            @RequestParam(defaultValue = "bentiressfarah12@gmail.com") String to) {
        try {
            String body = """
                    Bonjour,

                    Ceci est un e-mail de bienvenue envoyé par ShifaTech.
                    Si vous recevez ce message, la configuration SMTP fonctionne correctement.

                    Cordialement,
                    L'équipe ShifaTech
                    """;
            emailService.sendEmailSync(to, "Connexion SMTP vérifiée", body);
            return ResponseEntity.ok("E-mail envoyé avec succès à : " + to);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Échec SMTP : " + e.getMessage());
        }
    }
}