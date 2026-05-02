package com.example.adminservice.service;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.client.ApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final NotificationService notificationService;
    private final EmailService        emailService;
    private final ApiClient           apiClient;

    // ─────────────────────────────────────────────────────────────
    // Annulation
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleAnnulation(Integer idRdv, Integer idPatient,
                                 Integer idDocteur, Integer idInfirmier, String dateRdv) {
        log.info("[ANNULATION▶] RDV#{} patient={} docteur={} infirmier={} date={} | thread={}",
                 idRdv, idPatient, idDocteur, idInfirmier, dateRdv,
                 Thread.currentThread().getName());

        String token = apiClient.fetchJwtToken();
        if (token == null) {
            log.error("[ANNULATION✗] Token JWT null — événement ignoré pour RDV#{}", idRdv);
            return;
        }

        String msgPatient = "Votre rendez-vous du " + dateRdv + " a été annulé.";
        String msgInf     = "Le rendez-vous du " + dateRdv + " a été annulé.";

        notifyPatient(idRdv, idPatient, TypeNotif.INFO,
                      "ANNULE", msgPatient, "Annulation de rendez-vous", token);

        notifyInfirmiers(idRdv, idDocteur, idInfirmier, TypeNotif.INFO,
                         "ANNULE", msgInf, "Annulation de rendez-vous", token);

        log.info("[ANNULATION✓] RDV#{} traité", idRdv);
    }

    // ─────────────────────────────────────────────────────────────
    // Confirmation
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleConfirmation(Integer idRdv, Integer idPatient,
                                   Integer idDocteur, Integer idInfirmier, String dateRdv) {
        log.info("[CONFIRMATION▶] RDV#{} patient={} docteur={} infirmier={} date={} | thread={}",
                 idRdv, idPatient, idDocteur, idInfirmier, dateRdv,
                 Thread.currentThread().getName());

        String token = apiClient.fetchJwtToken();
        if (token == null) {
            log.error("[CONFIRMATION✗] Token JWT null — événement ignoré pour RDV#{}", idRdv);
            return;
        }

        String msgPatient = "Votre rendez-vous du " + dateRdv + " est confirmé.";
        String msgInf     = "Le rendez-vous du " + dateRdv + " est confirmé.";

        notifyPatient(idRdv, idPatient, TypeNotif.CONFIRMATION,
                      "CONFIRME", msgPatient, "Rendez-vous confirmé", token);

        notifyInfirmiers(idRdv, idDocteur, idInfirmier, TypeNotif.CONFIRMATION,
                         "CONFIRME", msgInf, "Rendez-vous confirmé", token);

        log.info("[CONFIRMATION✓] RDV#{} traité", idRdv);
    }

    // ─────────────────────────────────────────────────────────────
    // Modification
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleModification(Integer idRdv, Integer idPatient,
                                   Integer idDocteur, Integer idInfirmier, String dateRdv) {
        log.info("[MODIFICATION▶] RDV#{} patient={} docteur={} infirmier={} date={} | thread={}",
                 idRdv, idPatient, idDocteur, idInfirmier, dateRdv,
                 Thread.currentThread().getName());

        String token = apiClient.fetchJwtToken();
        if (token == null) {
            log.error("[MODIFICATION✗] Token JWT null — événement ignoré pour RDV#{}", idRdv);
            return;
        }

        String msgPatient = "Votre rendez-vous a été modifié. Nouvelle date : " + dateRdv + ".";
        String msgInf     = "Le planning a été mis à jour. Nouvelle date : " + dateRdv + ".";

        notifyPatient(idRdv, idPatient, TypeNotif.MODIFICATION,
                      "MODIFIE", msgPatient, "Rendez-vous modifié", token);

        if (idDocteur != null) {
            Integer idUserDocteur = apiClient.getUserIdForDoctor(idDocteur, token);
            if (idUserDocteur != null) {
                String notifMsg = "[RDV#" + idRdv + "] " + msgPatient;
                log.debug("[MODIFICATION→] Notification docteur userId={} RDV#{}", idUserDocteur, idRdv);
                notificationService.createNotification(idUserDocteur, TypeNotif.MODIFICATION, notifMsg);
                sendEmailSafe(idUserDocteur, "Rendez-vous modifié", msgPatient, token);
            } else {
                log.warn("[MODIFICATION✗] userId non résolu pour docteur#{} RDV#{}", idDocteur, idRdv);
            }
        }

        notifyInfirmiers(idRdv, idDocteur, idInfirmier, TypeNotif.MODIFICATION,
                         "MODIFIE", msgInf, "Modification du planning", token);

        log.info("[MODIFICATION✓] RDV#{} traité", idRdv);
    }

    // ─────────────────────────────────────────────────────────────
    // Nouveau RDV (EN_ATTENTE / CREATED)
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleNouveauRdv(Integer idRdv, Integer idPatient,
                                 Integer idDocteur, Integer idInfirmier, String dateRdv) {
        log.info("[NOUVEAU_RDV▶] RDV#{} patient={} docteur={} infirmier={} date={} | thread={}",
                 idRdv, idPatient, idDocteur, idInfirmier, dateRdv,
                 Thread.currentThread().getName());

        String token = apiClient.fetchJwtToken();
        if (token == null) {
            log.error("[NOUVEAU_RDV✗] Token JWT null — événement ignoré pour RDV#{}", idRdv);
            return;
        }

        String msgInf = "Un nouveau rendez-vous est en attente de confirmation pour le " + dateRdv + ".";

        notifyInfirmiers(idRdv, idDocteur, idInfirmier, TypeNotif.RDV,
                         "EN_ATTENTE", msgInf, "Nouveau rendez-vous", token);

        log.info("[NOUVEAU_RDV✓] RDV#{} traité", idRdv);
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private void notifyPatient(Integer idRdv, Integer idPatient, TypeNotif type,
                                String statut, String message, String emailSubject, String token) {
        if (idPatient == null) {
            log.debug("[NOTIFY_PATIENT] idPatient null pour RDV#{} — ignoré", idRdv);
            return;
        }

        Integer idUserPatient = apiClient.getPatientUserId(idPatient, token);
        if (idUserPatient == null) {
            log.warn("[NOTIFY_PATIENT✗] userId non résolu pour patient#{} RDV#{} — notification ignorée",
                     idPatient, idRdv);
            return;
        }

        String notifMsg = "[RDV#" + idRdv + "] " + message;
        log.debug("[NOTIFY_PATIENT→] RDV#{} userId={} msg='{}'", idRdv, idUserPatient, notifMsg);

        notificationService.createNotification(idUserPatient, type, notifMsg);
        sendEmailSafe(idUserPatient, emailSubject, message, token);
    }

    private void notifyInfirmiers(Integer idRdv, Integer idDocteur, Integer idInfirmier,
                                   TypeNotif type, String statut, String message,
                                   String emailSubject, String token) {
        String notifMsg = "[RDV#" + idRdv + "] " + message;

        if (idInfirmier != null) {
            log.debug("[NOTIFY_INF→] RDV#{} userId={} (direct) msg='{}'", idRdv, idInfirmier, notifMsg);
            notificationService.createNotification(idInfirmier, type, notifMsg);
            sendEmailSafe(idInfirmier, emailSubject, message, token);
            return;
        }

        List<Integer> infirmierIds = resolveInfirmierIds(idDocteur, token);
        log.debug("[NOTIFY_INF→] RDV#{} résolution via docteur={} → {} infirmier(s)",
                  idRdv, idDocteur, infirmierIds.size());

        if (infirmierIds.isEmpty()) {
            log.warn("[NOTIFY_INF✗] Aucun infirmier résolu pour RDV#{} docteur={}", idRdv, idDocteur);
        }

        for (Integer idInf : infirmierIds) {
            notificationService.createNotification(idInf, type, notifMsg);
            sendEmailSafe(idInf, emailSubject, message, token);
        }
    }

    private List<Integer> resolveInfirmierIds(Integer idDocteur, String token) {
        Integer idService = apiClient.getServiceIdForDoctor(idDocteur, token);
        if (idService != null) {
            log.debug("[RESOLVE_INF] docteur={} → service={}", idDocteur, idService);
            return apiClient.getInfirmiersUserIdsByService(idService, token);
        }
        log.warn("[RESOLVE_INF] service non résolu pour docteur={} — fallback tous infirmiers", idDocteur);
        return apiClient.getAllInfirmiersUserIds(token);
    }

    private void sendEmailSafe(Integer userId, String subject, String message, String token) {
        String email = apiClient.getUserEmail(userId, token);
        if (email == null) {
            log.warn("[EMAIL✗] Aucun email résolu pour userId={} — sujet='{}' abandonné", userId, subject);
            return;
        }
        log.debug("[EMAIL→] userId={} email={} sujet='{}'", userId, email, subject);
        emailService.sendEmail(email, subject, buildEmailBody(message));
    }

    private String buildEmailBody(String message) {
        return """
                Bonjour,

                %s

                ---
                Cet e-mail est envoyé automatiquement par ShifaTech.
                """.formatted(message);
    }
}
