package com.example.adminservice.controller;

import com.example.adminservice.dto.EventRequestDTO;
import com.example.adminservice.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Point d'entrée HTTP pour les événements de cycle de vie des rendez-vous.
 *
 * <pre>
 * Endpoint  : POST http://&lt;host&gt;:8080/api/admin/events
 * Appelant  : rdv-service (ou tout service autorisé)
 * Réponse   : 202 Accepted — retournée AVANT la fin du traitement (asynchrone)
 * </pre>
 *
 * Statuts supportés :
 * <pre>
 *   CONFIRME              → EventService.handleConfirmation()
 *   CREATED | EN_ATTENTE  → EventService.handleNouveauRdv()
 *   MODIFIE               → EventService.handleModification()
 *   ANNULE                → EventService.handleAnnulation()
 * </pre>
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final EventService eventService;

    @PostMapping("/events")
    public ResponseEntity<Void> receiveEvent(@RequestBody EventRequestDTO dto) {

        if (dto.getStatut() == null || dto.getIdRdv() == null) {
            log.warn("[EventController] Payload invalide rejeté — idRdv={} statut={}",
                     dto.getIdRdv(), dto.getStatut());
            return ResponseEntity.badRequest().build();
        }

        String statut  = dto.getStatut().trim().toUpperCase();
        String dateRdv = (dto.getDateRdv() != null && !dto.getDateRdv().isBlank())
                         ? dto.getDateRdv().trim()
                         : "N/A";

        log.info("[EventController▶] RDV#{} statut={} patient={} docteur={} infirmier={} date={} | thread={}",
                 dto.getIdRdv(), statut, dto.getIdPatient(), dto.getIdDocteur(),
                 dto.getIdInfirmier(), dateRdv, Thread.currentThread().getName());

        long start = System.currentTimeMillis();

        switch (statut) {
            case "CONFIRME" -> eventService.handleConfirmation(
                    dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);

            case "CREATED",
                 "EN_ATTENTE" -> eventService.handleNouveauRdv(
                    dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);

            case "MODIFIE" -> eventService.handleModification(
                    dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);

            case "ANNULE" -> eventService.handleAnnulation(
                    dto.getIdRdv(), dto.getIdPatient(), dto.getIdDocteur(), dto.getIdInfirmier(), dateRdv);

            default -> {
                log.warn("[EventController] Statut '{}' non reconnu pour RDV#{} — événement ignoré",
                         statut, dto.getIdRdv());
                return ResponseEntity.accepted().build();
            }
        }

        log.info("[EventController✓] RDV#{} [{}] dispatché en {}ms — traitement délégué au pool notif-async",
                 dto.getIdRdv(), statut, System.currentTimeMillis() - start);

        return ResponseEntity.accepted().build();
    }
}
