package com.example.adminservice.service;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.client.ApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ApiClient apiClient;


    public void handleAnnulation(Integer idRdv, Integer idPatient,
                                 Integer idDocteur, String dateRdv) {
        String token = apiClient.fetchJwtToken();
        if (token == null) { log.error("[ANNULATION] Token null"); return; }

        String displayMsg = "Votre rendez-vous du " + dateRdv + " a été annulé.";
        String notifMsg   = "[RDV#" + idRdv + "][ANNULE] " + displayMsg;

        if (idPatient != null) {
            Integer idUserPatient = apiClient.getUserIdForPatient(idPatient, token);
            if (idUserPatient != null) {
                notificationService.createNotification(idUserPatient, TypeNotif.INFO, notifMsg);
                String email = apiClient.getUserEmail(idUserPatient, token);
                if (email != null)
                    emailService.sendEmail(email, "Annulation de rendez-vous",
                            buildEmailBody("Annulation de rendez-vous", displayMsg));
            }
        }

        List<Integer> infirmierIds = resolveInfirmierIds(idDocteur, token);
        String displayMsgInf = "Le rendez-vous du " + dateRdv + " a été annulé.";
        String notifMsgInf   = "[RDV#" + idRdv + "][ANNULE] " + displayMsgInf;

        for (Integer idInf : infirmierIds) {
            notificationService.createNotification(idInf, TypeNotif.INFO, notifMsgInf);
            String email = apiClient.getUserEmail(idInf, token);
            if (email != null)
                emailService.sendEmail(email, "Annulation de rendez-vous",
                        buildEmailBody("Annulation de rendez-vous", displayMsgInf));
        }
    }

    public void handleConfirmation(Integer idRdv, Integer idPatient,
                                   Integer idDocteur, String dateRdv) {
        String token = apiClient.fetchJwtToken();
        if (token == null) return;

        String displayMsg = "Votre rendez-vous du " + dateRdv + " est confirmé.";
        String notifMsg   = "[RDV#" + idRdv + "][CONFIRME] " + displayMsg;

        if (idPatient != null) {
            Integer idUserPatient = apiClient.getUserIdForPatient(idPatient, token);
            if (idUserPatient != null) {
                notificationService.createNotification(idUserPatient, TypeNotif.CONFIRMATION, notifMsg);
                String email = apiClient.getUserEmail(idUserPatient, token);
                if (email != null)
                    emailService.sendEmail(email, "Rendez-vous confirmé",
                            buildEmailBody("Rendez-vous confirmé", displayMsg));
            }
        }

        List<Integer> infirmierIds = resolveInfirmierIds(idDocteur, token);
        String displayMsgInf = "Le rendez-vous du " + dateRdv + " est confirmé.";
        String notifMsgInf   = "[RDV#" + idRdv + "][CONFIRME] " + displayMsgInf;

        for (Integer idInf : infirmierIds) {
            notificationService.createNotification(idInf, TypeNotif.CONFIRMATION, notifMsgInf);
            String email = apiClient.getUserEmail(idInf, token);
            if (email != null)
                emailService.sendEmail(email, "Rendez-vous confirmé",
                        buildEmailBody("Rendez-vous confirmé", displayMsgInf));
        }

        log.info("[EVENT] Confirmation traitée pour RDV#{}", idRdv);
    }

    public void handleModification(Integer idRdv, Integer idPatient,
                                   Integer idDocteur, String dateRdv) {
        String token = apiClient.fetchJwtToken();
        if (token == null) return;

        String displayMsg = "Votre rendez-vous a été modifié. Nouvelle date : " + dateRdv + ".";
        String notifMsg   = "[RDV#" + idRdv + "][MODIFIE] " + displayMsg;

        if (idPatient != null) {
            Integer idUserPatient = apiClient.getUserIdForPatient(idPatient, token);
            if (idUserPatient != null) {
                notificationService.createNotification(idUserPatient, TypeNotif.MODIFICATION, notifMsg);
                String email = apiClient.getUserEmail(idUserPatient, token);
                if (email != null)
                    emailService.sendEmail(email, "Rendez-vous modifié",
                            buildEmailBody("Rendez-vous modifié", displayMsg));
            }
        }

        if (idDocteur != null) {
            Integer idUserDocteur = apiClient.getUserIdForDoctor(idDocteur, token);
            if (idUserDocteur != null) {
                notificationService.createNotification(idUserDocteur, TypeNotif.MODIFICATION, notifMsg);
                String email = apiClient.getUserEmail(idUserDocteur, token);
                if (email != null)
                    emailService.sendEmail(email, "Rendez-vous modifié",
                            buildEmailBody("Rendez-vous modifié", displayMsg));
            }
        }

        List<Integer> infirmierIds = resolveInfirmierIds(idDocteur, token);
        String displayMsgInf = "Le planning a été mis à jour. Nouvelle date : " + dateRdv + ".";
        String notifMsgInf   = "[RDV#" + idRdv + "][MODIFIE] " + displayMsgInf;

        for (Integer idInf : infirmierIds) {
            notificationService.createNotification(idInf, TypeNotif.MODIFICATION, notifMsgInf);
            String email = apiClient.getUserEmail(idInf, token);
            if (email != null)
                emailService.sendEmail(email, "Modification du planning",
                        buildEmailBody("Modification du planning", displayMsgInf));
        }

        log.info("[EVENT] Modification traitée pour RDV#{}", idRdv);
    }

    public void handleNouveauRdv(Integer idRdv, Integer idPatient,
                                 Integer idDocteur, String dateRdv) {
        String token = apiClient.fetchJwtToken();
        if (token == null) return;

        String displayMsg = "Un nouveau rendez-vous est en attente de confirmation pour le " + dateRdv + ".";
        String notifMsg   = "[RDV#" + idRdv + "][EN_ATTENTE] " + displayMsg;

        List<Integer> infirmierIds = resolveInfirmierIds(idDocteur, token);

        for (Integer idInf : infirmierIds) {
            notificationService.createNotification(idInf, TypeNotif.RDV, notifMsg);
            String email = apiClient.getUserEmail(idInf, token);
            if (email != null)
                emailService.sendEmail(email, "Nouveau rendez-vous",
                        buildEmailBody("Nouveau rendez-vous", displayMsg));
        }

        log.info("[EVENT] Nouveau RDV en attente traité pour RDV#{}", idRdv);
    }

    private List<Integer> resolveInfirmierIds(Integer idDocteur, String token) {
        Integer idService = apiClient.getServiceIdForDoctor(idDocteur, token);
        return idService != null
                ? apiClient.getInfirmiersUserIdsByService(idService, token)
                : apiClient.getAllInfirmiersUserIds(token);
    }


    private String buildEmailBody(String titre, String message) {
        return """
                Bonjour,

                %s

                ---
                Cet e-mail est envoyé par ShifaTech.
                """.formatted(message);
    }
}
