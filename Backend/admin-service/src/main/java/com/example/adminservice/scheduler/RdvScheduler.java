package com.example.adminservice.scheduler;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.client.ApiClient;
import com.example.adminservice.dto.external.AppointmentDTO;
import com.example.adminservice.exception.ServiceUnavailableException;
import com.example.adminservice.service.EmailService;
import com.example.adminservice.service.EventService;
import com.example.adminservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class RdvScheduler {

    private final ApiClient apiClient;
    private final NotificationService notificationService;
    private final EventService eventService;
    private final EmailService emailService;

    private final ConcurrentHashMap<Integer, String> rdvStatutCache = new ConcurrentHashMap<>();


    @Scheduled(cron = "0 0 * * * *")
    public void envoyerRappels24h() {
        log.info("[SCHEDULER] === Rappels 24h ===");
        String token = resolveToken();
        if (token == null) return;

        List<AppointmentDTO> rdvList = fetchAppointments(token);
        if (rdvList.isEmpty()) return;

        LocalDateTime in24h = LocalDateTime.now(ZoneOffset.UTC).plusHours(24);
        LocalDateTime in25h = LocalDateTime.now(ZoneOffset.UTC).plusHours(25);

        for (AppointmentDTO rdv : rdvList) {
            if (rdv.hasStatut("ANNULE") || rdv.getDateRdv() == null || rdv.getIdPatient() == null) continue;

            LocalDateTime dateRdv = rdv.getDateRdv().toLocalDateTime();
            if (!dateRdv.isAfter(in24h) || !dateRdv.isBefore(in25h)) continue;

            String message = "Rappel : vous avez un rendez-vous le "
                    + dateRdv.toLocalDate() + " à " + dateRdv.toLocalTime();

            notificationService.createNotification(rdv.getIdPatient(), TypeNotif.RAPPEL, message);

            Integer idUserPatient = apiClient.getUserIdForPatient(rdv.getIdPatient(), token);
            if (idUserPatient != null) {
                String email = apiClient.getUserEmail(idUserPatient, token);
                if (email != null) emailService.sendEmail(email, "Rappel de rendez-vous", message);
            }
        }
    }

    @Scheduled(cron = "0 * * * * *")
    public void detecterChangementsStatuts() {
        String token = resolveToken();
        if (token == null) return;

        List<AppointmentDTO> rdvList = fetchAppointments(token);

        for (AppointmentDTO rdv : rdvList) {
            if (rdv.getId() == null) continue;

            String currentStatut = rdv.getStatut();
            if (currentStatut == null) continue;

            String previousStatut = rdvStatutCache.put(rdv.getId(), currentStatut);
            if (currentStatut.equalsIgnoreCase(previousStatut)) continue;

            String dateStr = rdv.getDateRdv() != null
                    ? rdv.getDateRdv().toLocalDate().toString() : "N/A";

            log.info("[SCHEDULER] RDV#{} : {} → {}", rdv.getId(), previousStatut, currentStatut);

            switch (currentStatut.toUpperCase()) {
                case "ANNULE"     -> eventService.handleAnnulation(
                        rdv.getId(), rdv.getIdPatient(), rdv.getIdDocteur(), dateStr);
                case "CONFIRME"   -> eventService.handleConfirmation(
                        rdv.getId(), rdv.getIdPatient(), rdv.getIdDocteur(), dateStr);
                case "MODIFIE"    -> eventService.handleModification(
                        rdv.getId(), rdv.getIdPatient(), rdv.getIdDocteur(), dateStr);
                case "EN_ATTENTE" -> eventService.handleNouveauRdv(
                        rdv.getId(), rdv.getIdPatient(), rdv.getIdDocteur(), dateStr);
                default           -> log.debug("[SCHEDULER] Statut ignoré : {}", currentStatut);
            }
        }
    }

    private String resolveToken() {
        try {
            String token = apiClient.fetchJwtToken();
            if (token == null) log.error("[SCHEDULER] Token null, tâche ignorée");
            return token;
        } catch (ServiceUnavailableException e) {
            log.error("[SCHEDULER] {} — tâche ignorée", e.getMessage());
            return null;
        }
    }

    private List<AppointmentDTO> fetchAppointments(String token) {
        try {
            return apiClient.fetchAllAppointments(token);
        } catch (ServiceUnavailableException e) {
            log.error("[SCHEDULER] {} — tâche ignorée", e.getMessage());
            return List.of();
        }
    }
}
