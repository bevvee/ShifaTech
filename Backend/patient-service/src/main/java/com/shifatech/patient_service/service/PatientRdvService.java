package com.shifatech.patient_service.service;

import com.shifatech.patient_service.client.RdvServiceClient;
import com.shifatech.patient_service.dto.CreateRendezVousRequest;
import com.shifatech.patient_service.dto.RendezVousDTO;
import com.shifatech.patient_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientRdvService {

    private final RdvServiceClient rdvServiceClient;

    public RendezVousDTO takeAppointment(CreateRendezVousRequest request, String bearerToken) {
        log.info("Prise de rendez-vous pour le patient ID: {}", request.getIdPatient());
        return rdvServiceClient.createAppointment(request, bearerToken);
    }

    public void cancelAppointment(Integer id, String bearerToken) {
        log.info("Tentative d'annulation du rendez-vous ID: {}", id);

        RendezVousDTO appointment = rdvServiceClient.getAppointmentById(id, bearerToken);
        if (appointment == null) {
            throw new ResourceNotFoundException("Rendez-vous", "id", id.longValue());
        }

        // Vérification de la contrainte des 2 heures
        // On combine la date et l'heure du rendez-vous
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointment.getDateRdv(), appointment.getHeurRdv());
        LocalDateTime now = LocalDateTime.now();

        long minutesUntilAppointment = ChronoUnit.MINUTES.between(now, appointmentDateTime);

        if (minutesUntilAppointment < 120) {
            log.warn("Refus d'annulation pour le RDV ID: {} car l'échéance est dans {} minutes", id,
                    minutesUntilAppointment);
            throw new IllegalStateException("Impossible d'annuler un rendez-vous moins de 2 heures avant l'échéance.");
        }

        rdvServiceClient.cancelAppointment(id, bearerToken);
        log.info("Rendez-vous ID: {} annulé avec succès.", id);
    }
}
