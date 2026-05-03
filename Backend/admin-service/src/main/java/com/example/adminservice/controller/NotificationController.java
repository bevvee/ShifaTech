package com.example.adminservice.controller;

import com.example.adminservice.client.ApiClient;
import com.example.adminservice.dto.EventRequestDTO;
import com.example.adminservice.dto.NotificationDTO;
import com.example.adminservice.service.EventService;
import com.example.adminservice.service.NotificationService;
import com.example.adminservice.scheduler.RdvScheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final RdvScheduler        rdvScheduler;
    private final EventService        eventService;
    private final ApiClient           apiClient;

    // ── Réception des événements (Anciennement EventController) ────────────────

    @PostMapping({"/notifications/events", "/admin/events"})
    public ResponseEntity<Void> receiveEvent(@RequestBody EventRequestDTO dto) {
        if (dto.getStatut() == null || dto.getIdRdv() == null) return ResponseEntity.badRequest().build();
        
        String statut  = dto.getStatut().trim().toUpperCase();
        String dateRdv = (dto.getDateRdv() != null && !dto.getDateRdv().isBlank()) ? dto.getDateRdv().trim() : "N/A";

        log.info("[NotificationController] Evénement reçu : {} pour RDV#{}", statut, dto.getIdRdv());

        switch (statut) {
            case "CONFIRME" -> eventService.handleConfirmation(dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);
            case "CREATED", "EN_ATTENTE" -> eventService.handleNouveauRdv(dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);
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
        
        eventService.handlePlanningModification(dto.getIdDocteur(), dateRdv);
        return ResponseEntity.accepted().build();
    }

    // ── Lecture des notifications ────────────────────────────────────────────

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

    // ── Déclenchement manuel ─────────────────────────────────────────────────

    @PostMapping("/notifications/trigger-scheduler")
    public ResponseEntity<String> triggerScheduler() {
        rdvScheduler.envoyerRappels24h();
        return ResponseEntity.ok("Scheduler exécuté");
    }

    // ── Diagnostic ───────────────────────────────────────────────────────────

    /**
     * GET /api/notifications/diagnostic?userId=9
     *
     * Teste chaque maillon de la chaîne notification sans envoyer de vrai événement :
     *   1. Récupération du token JWT (auth-service)
     *   2. Résolution de l'e-mail pour un userId donné
     *
     * Permet d'identifier rapidement quelle étape bloque.
     */
    @GetMapping("/diagnostic")
    public ResponseEntity<Map<String, Object>> diagnostic(
            @RequestParam(defaultValue = "9") Integer userId) {

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("timestamp", LocalDateTime.now().toString());
        result.put("userId_teste", userId);

        // Étape 1 — Token JWT
        String token = null;
        try {
            token = apiClient.fetchJwtToken();
        } catch (Exception e) {
            result.put("token_erreur", e.getMessage());
        }

        if (token == null) {
            result.put("token_ok", false);
            result.put("token_detail", "null — vérifier AUTH_SERVICE_EMAIL / AUTH_SERVICE_PASSWORD dans docker-compose");
            result.put("email_ok", false);
            result.put("email_detail", "non testé (token absent)");
            log.error("[DIAGNOSTIC] Token null — chaîne de notification bloquée");
            return ResponseEntity.ok(result);
        }

        result.put("token_ok", true);
        result.put("token_preview", token.substring(0, Math.min(30, token.length())) + "...");

        // Étape 2 — Résolution e-mail de l'utilisateur
        String email = null;
        try {
            email = apiClient.getUserEmail(userId);
        } catch (Exception e) {
            result.put("email_erreur", e.getMessage());
        }

        if (email == null) {
            result.put("email_ok", false);
            result.put("email_detail", "null — userId=" + userId + " introuvable dans auth-service ou champ email vide");
            log.warn("[DIAGNOSTIC] Email null pour userId={}", userId);
        } else {
            result.put("email_ok", true);
            result.put("email_valeur", email);
            log.info("[DIAGNOSTIC] OK — token valide, email résolu : {}", email);
        }

        result.put("conclusion", result.get("email_ok").equals(true)
            ? "Chaîne OK — si l'e-mail n'arrive pas, vérifier les logs [ASYNC✗] dans docker logs admin-service"
            : "Chaîne BLOQUÉE — corriger le problème indiqué ci-dessus");

        return ResponseEntity.ok(result);
    }
}
