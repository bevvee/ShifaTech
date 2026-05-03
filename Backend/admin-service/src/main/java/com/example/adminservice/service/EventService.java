package com.example.adminservice.service;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.client.ApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ApiClient apiClient;
    
    // Cache statique partagé pour le dédoublonnement global (JVM)
    private static final java.util.Set<String> processedEvents = java.util.concurrent.ConcurrentHashMap.newKeySet();

    // ─────────────────────────────────────────────────────────────
    // Annulation
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleAnnulation(Integer idRdv, Integer idPatient,
                                 Integer idDocteur, Integer idInfirmier, String dateRdv) {
        String msg = "Votre rendez-vous du " + dateRdv + " a été annulé.";
        processRdvEvent("ANNUL", idRdv, idPatient, idDocteur, TypeNotif.INFO, msg, "Annulation de rendez-vous", false, dateRdv);
    }

    private static synchronized boolean isDuplicate(String eventKey) {
        if (!processedEvents.add(eventKey)) return true;
        new java.util.Timer().schedule(new java.util.TimerTask() {
            @Override
            public void run() { processedEvents.remove(eventKey); }
        }, 10000); // 10s
        return false;
    }

    // Clé partagée entre handleModification et handlePlanningModification.
    private static synchronized boolean isStaffNotifDuplicate(Integer idDocteur, String date) {
        String day = (date != null && date.length() >= 10) ? date.substring(0, 10) : String.valueOf(date);
        String key = "STAFF_NOTIF_" + idDocteur + "_" + day;
        if (!processedEvents.add(key)) return true;
        
        new java.util.Timer().schedule(new java.util.TimerTask() {
            @Override
            public void run() { processedEvents.remove(key); }
        }, 10000); // 10s
        return false;
    }

    // ─────────────────────────────────────────────────────────────
    // Confirmation
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleConfirmation(Integer idRdv, Integer idPatient,
                                   Integer idDocteur, Integer idInfirmier, String dateRdv) {
        String msg = "Votre rendez-vous du " + dateRdv + " est confirmé.";
        processRdvEvent("CONFIRM", idRdv, idPatient, idDocteur, TypeNotif.CONFIRMATION, msg, "Rendez-vous confirmé", false, dateRdv);
    }

    // ─────────────────────────────────────────────────────────────
    // Modification
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleModification(Integer idRdv, Integer idPatient,
                                   Integer idDocteur, Integer idInfirmier, String dateRdv) {
        String msg = "Le planning a été mis à jour. Nouvelle date : " + dateRdv + ".";
        processRdvEvent("MODIF", idRdv, idPatient, idDocteur, TypeNotif.MODIFICATION, msg, "Modification du planning", true, dateRdv);
    }

    // ─────────────────────────────────────────────────────────────
    // Nouveau RDV (EN_ATTENTE / CREATED)
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleNouveauRdv(Integer idRdv, Integer idPatient,
                                 Integer idDocteur, Integer idInfirmier, String dateRdv) {
        if (isDuplicate("NEW_RDV_" + idRdv)) return;
        String msg = "Un nouveau rendez-vous est en attente de confirmation pour le " + dateRdv + ".";
        notifyStaff(idRdv, idDocteur, TypeNotif.RDV, "Nouveau rendez-vous", msg);
    }

    // ─────────────────────────────────────────────────────────────
    // Modification de Planning
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handlePlanningModification(Integer idDocteur, String date) {
        String eventKey = "PLANNING_" + idDocteur + "_" + date;
        if (!processedEvents.add(eventKey)) return;
        
        new java.util.Timer().schedule(new java.util.TimerTask() {
            @Override
            public void run() { processedEvents.remove(eventKey); }
        }, 5000);

        if (isStaffNotifDuplicate(idDocteur, date)) return;

        String msg = "Le planning a été mis à jour pour le " + date + ".";
        notifyStaff(null, idDocteur, TypeNotif.MODIFICATION, "Planning modifié", msg);
    }

    // ─────────────────────────────────────────────────────────────
    // Generic Processor & Helpers
    // ─────────────────────────────────────────────────────────────

    private void processRdvEvent(String prefix, Integer idRdv, Integer idPatient, Integer idDocteur,
                                TypeNotif type, String msg, String subject, boolean checkStaffDupe, String date) {
        if (isDuplicate(prefix + "_" + idRdv)) return;

        log.info("[EVENT] {} RDV#{} - dispatching notifications", prefix, idRdv);

        // 1. Patient
        notifyPatient(idRdv, idPatient, type, msg, subject);

        // 2. Docteur
        Integer idUserDocteur = (idDocteur != null) ? apiClient.getUserIdForDoctor(idDocteur) : null;
        if (idUserDocteur != null) {
            notificationService.createNotification(idUserDocteur, type, subject, "[RDV#" + idRdv + "] " + msg);
            sendEmailSafe(idUserDocteur, subject, msg);
        }

        // 3. Personnel (Infirmiers + Secrétaires)
        if (!checkStaffDupe || !isStaffNotifDuplicate(idDocteur, date)) {
            notifyStaff(idRdv, idDocteur, type, subject, msg);
        }
    }

    private void notifyStaff(Integer idRdv, Integer idDocteur, TypeNotif type, String subject, String message) {
        String notifMsg = (idRdv != null) ? "[RDV#" + idRdv + "] " + message : message;
        Integer idUserDocteur = (idDocteur != null) ? apiClient.getUserIdForDoctor(idDocteur) : null;

        Set<Integer> targetUserIds = new HashSet<>();
        targetUserIds.addAll(resolveInfirmierIds(idDocteur));
        targetUserIds.addAll(apiClient.getSecretairesUserIds());

        Set<String> processedEmails = new HashSet<>();
        for (Integer userId : targetUserIds) {
            if (userId.equals(idUserDocteur)) continue;
            
            // 1. WebSocket / In-app (toujours par ID)
            notificationService.createNotification(userId, type, subject, notifMsg);
            
            // 2. Email (dédupliqué par adresse)
            String email = apiClient.getUserEmail(userId);
            if (email != null && processedEmails.add(email.toLowerCase())) {
                emailService.sendEmail(email, subject, buildEmailBody(message));
            }
        }
    }

    private void notifyPatient(Integer idRdv, Integer idPatient, TypeNotif type, String message, String emailSubject) {
        if (idPatient == null) return;
        Integer idUserPatient = apiClient.getPatientUserId(idPatient);
        if (idUserPatient == null) return;

        notificationService.createNotification(idUserPatient, type, emailSubject, "[RDV#" + idRdv + "] " + message);
        sendEmailSafe(idUserPatient, emailSubject, message);
    }

    private List<Integer> resolveInfirmierIds(Integer idDocteur) {
        Integer idService = apiClient.getServiceIdForDoctor(idDocteur);
        return (idService != null) ? apiClient.getInfirmiersUserIdsByService(idService) : apiClient.getAllInfirmiersUserIds();
    }

    private void sendEmailSafe(Integer userId, String subject, String message) {
        String email = apiClient.getUserEmail(userId);
        if (email != null) {
            emailService.sendEmail(email, subject, buildEmailBody(message));
        }
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
