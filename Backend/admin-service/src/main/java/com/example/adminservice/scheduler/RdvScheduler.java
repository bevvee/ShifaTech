package com.example.adminservice.scheduler;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.client.ApiClient;
import com.example.adminservice.service.EventService;
import com.example.adminservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RdvScheduler {

    private final ApiClient apiClient;
    private final NotificationService notificationService;
    private final EventService eventService;  // ← nouveau

    // ─── Rappels 24h ───
    @Scheduled(cron = "0 0 * * * *")
    public void envoyerRappels24h() {
        log.info("=== [SCHEDULER] Rappels 24h ===");
        String token = apiClient.fetchJwtToken();
        if (token == null) return;

        List<Map<String, Object>> rdvList = apiClient.fetchAllAppointments(token);
        if (rdvList == null) return;

        LocalDateTime in24h = LocalDateTime.now(ZoneOffset.UTC).plusHours(24);
        LocalDateTime in25h = LocalDateTime.now(ZoneOffset.UTC).plusHours(25);

        for (Map<String, Object> rdv : rdvList) {
            String statut = rdv.getOrDefault("statut", "").toString();
            if ("ANNULE".equalsIgnoreCase(statut)) continue;

            LocalDateTime dateRdv = parseDateTime(rdv);
            Integer idPatient = toInt(rdv.get("idPatient"));
            if (dateRdv == null || idPatient == null) continue;

            if (dateRdv.isAfter(in24h) && dateRdv.isBefore(in25h)) {
                String message = "Rappel : vous avez un rendez-vous le "
                        + dateRdv.toLocalDate() + " à " + dateRdv.toLocalTime();
                notificationService.createNotification(idPatient, TypeNotif.RAPPEL, message);
            }
        }
    }

    // ─── Détection annulations automatique ───
    @Scheduled(cron = "0 * * * * *") // toutes les minutes
    public void detecterAnnulations() {
        log.info("=== [SCHEDULER] Détection Annulations ===");
        String token = apiClient.fetchJwtToken();
        if (token == null) return;

        List<Map<String, Object>> rdvList = apiClient.fetchAllAppointments(token);
        if (rdvList == null) return;

        for (Map<String, Object> rdv : rdvList) {
            String statut = rdv.getOrDefault("statut", "").toString();
            if (!"ANNULE".equalsIgnoreCase(statut)) continue;

            Integer idRdv     = toInt(rdv.get("id"));
            Integer idPatient = toInt(rdv.get("idPatient"));
            Integer idDocteur = toInt(rdv.get("idDocteur"));
            String  dateRdv   = extractDateString(rdv);

            if (idRdv == null || idPatient == null) continue;

            // Anti-doublon : si déjà notifié → skip
            String marker = "[RDV#" + idRdv + "] Votre rendez-vous est annulé";
            if (notificationService.alreadyNotified(idPatient, marker)) continue;

            // Déclenche tout automatiquement
            eventService.handleAnnulation(idRdv, idPatient, idDocteur, dateRdv);
        }
    }

    private String extractDateString(Map<String, Object> rdv) {
        Object d = rdv.get("dateRdv");
        if (d == null) return "N/A";
        String s = d.toString();
        return s.length() >= 10 ? s.substring(0, 10) : s;
    }

    private LocalDateTime parseDateTime(Map<String, Object> rdv) {
        try {
            String dateStr = (String) rdv.get("dateRdv");
            if (dateStr == null) return null;
            return OffsetDateTime.parse(dateStr,
                    DateTimeFormatter.ISO_OFFSET_DATE_TIME).toLocalDateTime();
        } catch (Exception e) { return null; }
    }

    private Integer toInt(Object val) {
        if (val == null) return null;
        try { return Integer.parseInt(val.toString()); }
        catch (Exception e) { return null; }
    }
}