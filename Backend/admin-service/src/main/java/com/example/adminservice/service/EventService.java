package com.example.adminservice.service;

import com.example.adminservice.Enum.TypeNotif;
import com.example.adminservice.client.ApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
        if (token == null) return;

        String message = "[RDV#" + idRdv + "] Votre rendez-vous est annulé le " + dateRdv;

        // 1. Patient
        if (idPatient != null) {
            notificationService.createNotification(idPatient, TypeNotif.INFO, message);
            String email = apiClient.getUserEmail(idPatient, token);
            if (email != null)
                emailService.sendEmail(email, "Rendez-vous annulé", message);
        }

        // 2. Docteur
        if (idDocteur != null) {
            Integer idUserDocteur = apiClient.getUserIdForDoctor(idDocteur, token);
            if (idUserDocteur != null) {
                notificationService.createNotification(idUserDocteur, TypeNotif.INFO, message);
                String email = apiClient.getUserEmail(idUserDocteur, token);
                if (email != null)
                    emailService.sendEmail(email, "Rendez-vous annulé", message);
            }
        }

        // 3. Infirmiers
        String msgInfirmier = "[PLANNING] Rendez-vous annulé le " + dateRdv;
        for (Integer idInf : apiClient.getAllInfirmiersUserIds(token)) {
            notificationService.createNotification(idInf, TypeNotif.INFO, msgInfirmier);
            String email = apiClient.getUserEmail(idInf, token);
            if (email != null)
                emailService.sendEmail(email, "Annulation planning", msgInfirmier);
        }

        log.info("Annulation traitée pour RDV#{}", idRdv);
    }
}