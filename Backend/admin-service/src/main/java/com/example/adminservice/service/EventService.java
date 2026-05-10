package com.example.adminservice.service;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.client.ApiClient;
import com.example.adminservice.entity.ServiceSF;
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
    private final ServiceSFService serviceSFService;
    
    // Cache statique partagé pour le dédoublonnement global (JVM)
    private static final java.util.Map<String, Long> processedEvents = new java.util.concurrent.ConcurrentHashMap<>();

    // ─────────────────────────────────────────────────────────────
    // Annulation
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleAnnulation(Integer idRdv, Integer idPatient,
                                 Integer idDocteur, Integer idInfirmier, String dateRdv) {
        if (isEventDuplicate("ANNUL_" + idRdv, 3000)) return;

        String subject = "Annulation de rendez-vous";
        String msg = "Votre rendez-vous du " + dateRdv + " a été annulé.";

        log.info("[EVENT] ANNUL RDV#{} - dispatching notifications", idRdv);

        // 1. Patient (uniquement email)
        notifyPatient(idRdv, idPatient, TypeNotif.INFO, msg, subject);

        // 2. Docteur
        if (idDocteur != null) {
            Integer idUserDocteur = apiClient.getUserIdForDoctor(idDocteur);
            if (idUserDocteur != null) {
                String msgDoctor = "Le rendez-vous du " + dateRdv + " a été annulé.";
                notificationService.createNotification(idUserDocteur, TypeNotif.INFO, subject, "[RDV#" + idRdv + "] " + msgDoctor);
                sendEmailSafe(idUserDocteur, subject, msgDoctor);
            }
        }
    }

    private static boolean isEventDuplicate(String eventKey, long timeoutMs) {
        long now = System.currentTimeMillis();
        Long lastSeen = processedEvents.get(eventKey);
        if (lastSeen != null && (now - lastSeen) < timeoutMs) {
            return true;
        }
        processedEvents.put(eventKey, now);
        return false;
    }

    private static boolean isStaffNotifDuplicate(Integer idDocteur, String date) {
        String day = (date != null && date.length() >= 10) ? date.substring(0, 10) : String.valueOf(date);
        String key = "STAFF_NOTIF_" + idDocteur + "_" + day;
        return isEventDuplicate(key, 3000); // 3s
    }

    // ─────────────────────────────────────────────────────────────
    // Confirmation
    // ─────────────────────────────────────────────────────────────

    @Async("notificationTaskExecutor")
    public void handleConfirmation(Integer idRdv, Integer idPatient,
                                   Integer idDocteur, Integer idInfirmier, String dateRdv) {
        if (isEventDuplicate("CONFIRM_" + idRdv, 3000)) return;

        String subject = "Rendez-vous confirmé";
        String msgPatient = "Votre rendez-vous du " + dateRdv + " est en statut : CONFIRMÉ.";
        String msgDoctor = "Vous avez un rendez-vous à l'horaire " + dateRdv + ".";

        log.info("[EVENT] CONFIRM RDV#{} - dispatching notifications", idRdv);

        // 1. Patient
        notifyPatient(idRdv, idPatient, TypeNotif.CONFIRMATION, msgPatient, subject);

        // 2. Docteur
        Integer idUserDocteur = (idDocteur != null) ? apiClient.getUserIdForDoctor(idDocteur) : null;
        if (idUserDocteur != null) {
            notificationService.createNotification(idUserDocteur, TypeNotif.CONFIRMATION, subject, "[RDV#" + idRdv + "] " + msgDoctor);
            sendEmailSafe(idUserDocteur, subject, msgDoctor);
        }

        // 3. Pas de notification pour les infirmiers
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
                                 Integer idDocteur, Integer idInfirmier, String dateRdv, String statut) {
        String msg = "Votre rendez-vous du " + dateRdv + " est en statut : " + statut + ".";
        
        if (statut != null && statut.toUpperCase().contains("ATTENTE")) {
            if (isEventDuplicate("NEW_RDV_" + idRdv, 3000)) return;
            log.info("[EVENT] NEW_RDV RDV#{} - dispatching notifications (Patient only for EN_ATTENTE)", idRdv);
            notifyPatient(idRdv, idPatient, TypeNotif.RDV, msg, "Statut de votre rendez-vous");
        } else {
            processRdvEvent("NEW_RDV", idRdv, idPatient, idDocteur, TypeNotif.RDV, msg, "Statut de votre rendez-vous", false, dateRdv);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Modification de Planning
    // ─────────────────────────────────────────────────────────────

    // Buffer pour regrouper les événements de planning rapprochés
    private static final java.util.Map<Integer, PendingPlanningEvent> pendingPlanningEvents = new java.util.concurrent.ConcurrentHashMap<>();

    private static class PendingPlanningEvent {
        String date;
        String statut;
        boolean hasPauseModifie;
    }

    @Async("notificationTaskExecutor")
    public void handlePlanningModification(Integer idDocteur, String date, String statut) {
        boolean isPause = statut != null && statut.toUpperCase().contains("PAUSE");

        pendingPlanningEvents.compute(idDocteur, (id, current) -> {
            if (current == null) {
                PendingPlanningEvent event = new PendingPlanningEvent();
                event.date = date; // On garde la date du premier événement reçu (ou celui de la pause)
                event.statut = statut;
                event.hasPauseModifie = isPause;
                return event;
            } else {
                // Si on a déjà un événement en attente, on donne la priorité à la pause
                if (isPause) {
                    current.date = date;
                    current.statut = statut;
                    current.hasPauseModifie = true;
                }
                return current;
            }
        });

        // On lance un délai de 2 secondes pour attendre d'autres potentiels événements du même batch
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // On retire l'événement du buffer (seul un thread réussira à le retirer et à notifier)
        PendingPlanningEvent finalEvent = pendingPlanningEvents.remove(idDocteur);
        if (finalEvent == null) {
            return; // Un autre thread a déjà traité ce batch
        }

        String finalStatut = finalEvent.statut;
        String finalDate = finalEvent.date;
        boolean finalIsPause = finalEvent.hasPauseModifie;

        String nomDocteur = apiClient.getDoctorFullName(idDocteur);
        Integer idService = apiClient.getServiceIdForDoctor(idDocteur);
        String labelService = resolveServiceLabel(idService);

        log.info("[EVENT] PLANNING BATCH traité par {} (service: {}) pour le {} avec statut prioritaire {}", nomDocteur, labelService, finalDate, finalStatut);

        String typeModif = finalIsPause ? "les horaires de sa pause" : "son planning";
        String jourAffiche = formatDay(finalDate);

        // Message pour les infirmiers du service : précis avec nom docteur
        String msgInfirmiers = String.format("%s a modifié %s pour la journée du %s.", nomDocteur, typeModif, jourAffiche);

        // Message pour les secrétaires : nom docteur + nom du service
        String msgSecretaires = String.format("[%s] %s a modifié %s pour la journée du %s.", labelService, nomDocteur, typeModif, jourAffiche);

        String titre = finalIsPause ? "Modification de pause" : "Modification de planning";

        // 1. Notifier les infirmiers du service du docteur (in-app uniquement)
        notifyInfirmiersPlanningChange(idDocteur, idService, titre, msgInfirmiers);

        // 2. Notifier toutes les secrétaires (in-app uniquement, avec précision du service)
        notifySecretairesPlanningChange(titre, msgSecretaires);
    }

    private String formatDay(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return "inconnue";
        String upper = dateStr.toUpperCase();
        if (upper.startsWith("MONDAY")) return "Lundi";
        if (upper.startsWith("TUESDAY")) return "Mardi";
        if (upper.startsWith("WEDNESDAY")) return "Mercredi";
        if (upper.startsWith("THURSDAY")) return "Jeudi";
        if (upper.startsWith("FRIDAY")) return "Vendredi";
        if (upper.startsWith("SATURDAY")) return "Samedi";
        if (upper.startsWith("SUNDAY")) return "Dimanche";
        
        if (dateStr.contains(" ")) {
            return dateStr.split(" ")[0]; // Extraire la date s'il y a une heure
        }
        return dateStr;
    }

    // ─────────────────────────────────────────────────────────────
    // Generic Processor & Helpers
    // ─────────────────────────────────────────────────────────────

    private void processRdvEvent(String prefix, Integer idRdv, Integer idPatient, Integer idDocteur,
                                TypeNotif type, String msg, String subject, boolean checkStaffDupe, String date) {
        if (isEventDuplicate(prefix + "_" + idRdv, 3000)) return;

        log.info("[EVENT] {} RDV#{} - dispatching notifications", prefix, idRdv);

        // 1. Patient
        notifyPatient(idRdv, idPatient, type, msg, subject);

        // 2. Docteur
        Integer idUserDocteur = (idDocteur != null) ? apiClient.getUserIdForDoctor(idDocteur) : null;
        if (idUserDocteur != null) {
            notificationService.createNotification(idUserDocteur, type, subject, "[RDV#" + idRdv + "] " + msg);
            if (type == TypeNotif.CONFIRMATION) {
                sendEmailSafe(idUserDocteur, subject, msg);
            }
        }

        // 3. Personnel (Infirmiers + Secrétaires)
        if (!checkStaffDupe || !isStaffNotifDuplicate(idDocteur, date)) {
            notifyStaff(idRdv, idDocteur, type, subject, msg);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Planning-specific Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Notifie les infirmiers du service du docteur (in-app + email MailHog).
     * Si le service est inconnu, tous les infirmiers sont notifiés.
     */
    private void notifyInfirmiersPlanningChange(Integer idDocteur, Integer idService, String titre, String message) {
        List<Integer> infirmierIds = resolveInfirmierIds(idDocteur);
        Integer idUserDocteur = (idDocteur != null) ? apiClient.getUserIdForDoctor(idDocteur) : null;

        Set<Integer> seen = new HashSet<>();
        Set<String> processedEmails = new HashSet<>();
        for (Integer userId : infirmierIds) {
            if (!seen.add(userId)) continue;
            if (userId.equals(idUserDocteur)) continue; // ne pas notifier le docteur lui-même

            // Notification in-app (WebSocket)
            notificationService.createNotification(userId, TypeNotif.MODIFICATION, titre, message);
            log.debug("[PLANNING] Infirmier userId={} notifié in-app : {}", userId, message);

            // Email via MailHog
            String email = apiClient.getUserEmail(userId);
            if (email != null && processedEmails.add(email.toLowerCase())) {
                emailService.sendEmail(email, titre, buildEmailBody(message));
                log.debug("[PLANNING] Email envoyé à l'infirmier {} : {}", email, message);
            }
        }
    }

    /**
     * Notifie toutes les secrétaires (in-app + email MailHog).
     * Le message inclut déjà le nom du service pour combler l'absence d'ID service côté secrétaire.
     */
    private void notifySecretairesPlanningChange(String titre, String message) {
        List<Integer> secretaireIds = apiClient.getSecretairesUserIds();
        Set<Integer> seen = new HashSet<>();
        Set<String> processedEmails = new HashSet<>();
        for (Integer userId : secretaireIds) {
            if (!seen.add(userId)) continue;

            // Notification in-app (WebSocket)
            notificationService.createNotification(userId, TypeNotif.MODIFICATION, titre, message);
            log.debug("[PLANNING] Secrétaire userId={} notifiée in-app : {}", userId, message);

            // Email via MailHog
            String email = apiClient.getUserEmail(userId);
            if (email != null && processedEmails.add(email.toLowerCase())) {
                emailService.sendEmail(email, titre, buildEmailBody(message));
                log.debug("[PLANNING] Email envoyé à la secrétaire {} : {}", email, message);
            }
        }
    }

    /**
     * Résout le label du service médical à partir de son ID.
     * Retourne "Service inconnu" si l'ID est null ou introuvable.
     */
    private String resolveServiceLabel(Integer idService) {
        if (idService == null) return "Service inconnu";
        try {
            ServiceSF service = serviceSFService.getById(idService);
            return (service.getLabel() != null && !service.getLabel().isBlank())
                    ? service.getLabel()
                    : "Service #" + idService;
        } catch (Exception e) {
            log.warn("[PLANNING] Service #{} introuvable : {}", idService, e.getMessage());
            return "Service #" + idService;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Generic RDV Helpers
    // ─────────────────────────────────────────────────────────────

    private void notifyStaff(Integer idRdv, Integer idDocteur, TypeNotif type, String subject, String message) {
        String rdvPrefix = (idRdv != null) ? "[RDV#" + idRdv + "] " : "";

        // Nom dynamique du docteur et de son service (aucun hard-coding)
        String nomDocteur     = (idDocteur != null) ? apiClient.getDoctorFullName(idDocteur) : "Un medecin";
        Integer idService     = (idDocteur != null) ? apiClient.getServiceIdForDoctor(idDocteur) : null;
        String labelService   = resolveServiceLabel(idService);
        Integer idUserDocteur = (idDocteur != null) ? apiClient.getUserIdForDoctor(idDocteur) : null;

        // ── 1. Infirmiers du service : message avec nom du docteur ────────
        String msgInfirmiers = rdvPrefix + nomDocteur + " - " + message;
        Set<Integer> seenInf  = new HashSet<>();
        Set<String>  emailsInf = new HashSet<>();
        for (Integer userId : resolveInfirmierIds(idDocteur)) {
            if (!seenInf.add(userId)) continue;
            if (userId.equals(idUserDocteur)) continue;

            notificationService.createNotification(userId, type, subject, msgInfirmiers);

            String email = apiClient.getUserEmail(userId);
            if (email != null && emailsInf.add(email.toLowerCase())) {
                emailService.sendEmail(email, subject, buildEmailBody(msgInfirmiers));
            }
        }

        // ── 2. Secretaires (toutes) : nom docteur + nom du service ────────
        String msgSecretaires = rdvPrefix + nomDocteur + " - Service : " + labelService + " - " + message;
        Set<Integer> seenSec   = new HashSet<>();
        Set<String>  emailsSec = new HashSet<>();
        for (Integer userId : apiClient.getSecretairesUserIds()) {
            if (!seenSec.add(userId)) continue;
            if (userId.equals(idUserDocteur)) continue;

            notificationService.createNotification(userId, type, subject, msgSecretaires);

            String email = apiClient.getUserEmail(userId);
            if (email != null && emailsSec.add(email.toLowerCase())) {
                emailService.sendEmail(email, subject, buildEmailBody(msgSecretaires));
            }
        }
    }

    private void notifyPatient(Integer idRdv, Integer idPatient, TypeNotif type, String message, String emailSubject) {
        if (idPatient == null) return;
        Integer idUserPatient = apiClient.getPatientUserId(idPatient);
        if (idUserPatient == null) return;

        // Uniquement par email (MailHog), plus de notification in-app pour le patient
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
