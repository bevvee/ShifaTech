package com.shifatech.patient_service.client;

import com.shifatech.patient_service.dto.RendezVousDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RendezVousClientService {

    private final RestTemplate restTemplate;

    // URL du microservice Rendez-Vous (à adapter selon votre configuration)
    private static final String RDV_SERVICE_URL = "http://localhost:8082/api/rendez-vous";

    // Créer un rendez-vous
    public RendezVousDTO createRendezVous(RendezVousDTO dto) {
        return restTemplate.postForObject(RDV_SERVICE_URL, dto, RendezVousDTO.class);
    }

    // Récupérer les rendez-vous d'un utilisateur
    public List<RendezVousDTO> getRendezVousByUser(Long idUser) {
        String url = RDV_SERVICE_URL + "/user/" + idUser;
        RendezVousDTO[] rdvArray = restTemplate.getForObject(url, RendezVousDTO[].class);
        return Arrays.asList(rdvArray != null ? rdvArray : new RendezVousDTO[0]);
    }

    // Annuler un rendez-vous
    public void cancelRendezVous(Long idRendezVous) {
        String url = RDV_SERVICE_URL + "/" + idRendezVous;
        restTemplate.delete(url);
    }

    // Récupérer l'historique des rendez-vous
    public List<RendezVousDTO> getHistoriqueRendezVous(Long idUser) {
        String url = RDV_SERVICE_URL + "/user/" + idUser + "/historique";
        RendezVousDTO[] rdvArray = restTemplate.getForObject(url, RendezVousDTO[].class);
        return Arrays.asList(rdvArray != null ? rdvArray : new RendezVousDTO[0]);
    }
}