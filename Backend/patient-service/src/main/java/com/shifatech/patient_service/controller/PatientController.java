package com.shifatech.patient_service.controller;

import com.shifatech.patient_service.client.RendezVousClientService;
import com.shifatech.patient_service.dto.*;
import com.shifatech.patient_service.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientProfileService profileService;
    private final DossierMedicalService dossierMedicalService;
    private final OrdonnanceService ordonnanceService;
    private final AfficheService afficheService;
    private final RendezVousClientService rendezVousClient;

    // ==================== PROFIL ====================

    /**
     * Consulter son profil complet
     * GET /api/patient/profile/{idUser}
     */
    @GetMapping("/profile/{idUser}")
    public ResponseEntity<PatientProfileDTO> getProfile(@PathVariable Long idUser) {
        log.info("Consultation du profil pour l'utilisateur: {}", idUser);
        return ResponseEntity.ok(profileService.getCompleteProfile(idUser));
    }

    /**
     * Mettre à jour son profil (poids, taille, téléphone, adresse)
     * PUT /api/patient/profile/{idUser}
     */
    @PutMapping("/profile/{idUser}")
    public ResponseEntity<PatientProfileDTO> updateProfile(
            @PathVariable Long idUser,
            @RequestBody UpdateProfileRequest request) {
        log.info("Mise à jour du profil pour l'utilisateur: {}", idUser);
        return ResponseEntity.ok(profileService.updateProfile(idUser, request));
    }

    // ==================== DOSSIER MÉDICAL ====================

    /**
     * Consulter son dossier médical
     * GET /api/patient/{idPatient}/dossier-medical
     */
    @GetMapping("/{idPatient}/dossier-medical")
    public ResponseEntity<DossierMedicalDTO> getDossierMedical(@PathVariable Long idPatient) {
        log.info("Consultation du dossier médical du patient: {}", idPatient);
        return ResponseEntity.ok(dossierMedicalService.getDossierMedicalByPatient(idPatient));
    }

    /**
     * Vérifier si le patient a un dossier médical
     * GET /api/patient/{idPatient}/dossier-medical/exists
     */
    @GetMapping("/{idPatient}/dossier-medical/exists")
    public ResponseEntity<Boolean> hasDossierMedical(@PathVariable Long idPatient) {
        log.info("Vérification de l'existence du dossier médical pour le patient: {}", idPatient);
        return ResponseEntity.ok(dossierMedicalService.hasDossierMedical(idPatient));
    }

    // ==================== ORDONNANCES ====================

    /**
     * Consulter toutes ses ordonnances
     * GET /api/patient/{idPatient}/ordonnances
     */
    @GetMapping("/{idPatient}/ordonnances")
    public ResponseEntity<List<OrdonnanceDTO>> getOrdonnances(@PathVariable Long idPatient) {
        log.info("Consultation des ordonnances du patient: {}", idPatient);
        return ResponseEntity.ok(ordonnanceService.getOrdonnancesByPatient(idPatient));
    }

    /**
     * Consulter une ordonnance spécifique
     * GET /api/patient/ordonnances/{idOrdonnance}
     */
    @GetMapping("/ordonnances/{idOrdonnance}")
    public ResponseEntity<OrdonnanceDTO> getOrdonnance(@PathVariable Long idOrdonnance) {
        log.info("Consultation de l'ordonnance: {}", idOrdonnance);
        return ResponseEntity.ok(ordonnanceService.getOrdonnanceById(idOrdonnance));
    }

    // ==================== AFFICHES ====================

    /**
     * Consulter ses affiches
     * GET /api/patient/{idPatient}/affiches
     */
    @GetMapping("/{idPatient}/affiches")
    public ResponseEntity<List<AfficheDTO>> getMyAffiches(@PathVariable Long idPatient) {
        log.info("Consultation des affiches du patient: {}", idPatient);
        return ResponseEntity.ok(afficheService.getAffichesByPatient(idPatient));
    }

    /**
     * Consulter toutes les affiches publiques
     * GET /api/patient/affiches/all
     */
    @GetMapping("/affiches/all")
    public ResponseEntity<List<AfficheDTO>> getAllAffiches() {
        log.info("Consultation de toutes les affiches");
        return ResponseEntity.ok(afficheService.getAllAffiches());
    }

    /**
     * Consulter une affiche spécifique
     * GET /api/patient/affiches/{idAffiche}
     */
    @GetMapping("/affiches/{idAffiche}")
    public ResponseEntity<AfficheDTO> getAffiche(@PathVariable Long idAffiche) {
        log.info("Consultation de l'affiche: {}", idAffiche);
        return ResponseEntity.ok(afficheService.getAfficheById(idAffiche));
    }

    // ==================== RENDEZ-VOUS ====================

    /**
     * Prendre un rendez-vous
     * POST /api/patient/rendez-vous
     */
    @PostMapping("/rendez-vous")
    public ResponseEntity<RendezVousDTO> createRendezVous(@RequestBody CreateRendezVousRequest request) {
        log.info("Création d'un rendez-vous pour le patient: {}", request.getIdPatient());

        RendezVousDTO rdvRequest = new RendezVousDTO();
        rdvRequest.setIdPatient(request.getIdPatient());
        rdvRequest.setIdDocteur(request.getIdDocteur());
        rdvRequest.setDateRendezVous(request.getDateRdv());

        RendezVousDTO rdv = rendezVousClient.createRendezVous(rdvRequest);
        return ResponseEntity.ok(rdv);
    }

    /**
     * Consulter l'historique de ses rendez-vous
     * GET /api/patient/{idUser}/rendez-vous/historique
     */
    @GetMapping("/{idUser}/rendez-vous/historique")
    public ResponseEntity<List<RendezVousDTO>> getHistoriqueRendezVous(@PathVariable Long idUser) {
        log.info("Consultation de l'historique des rendez-vous pour l'utilisateur: {}", idUser);
        return ResponseEntity.ok(rendezVousClient.getHistoriqueRendezVous(idUser));
    }

    /**
     * Consulter ses rendez-vous en cours
     * GET /api/patient/{idUser}/rendez-vous
     */
    @GetMapping("/{idUser}/rendez-vous")
    public ResponseEntity<List<RendezVousDTO>> getRendezVous(@PathVariable Long idUser) {
        log.info("Consultation des rendez-vous pour l'utilisateur: {}", idUser);
        return ResponseEntity.ok(rendezVousClient.getRendezVousByUser(idUser));
    }

    /**
     * Annuler un rendez-vous
     * DELETE /api/patient/rendez-vous/{idRendezVous}
     */
    @DeleteMapping("/rendez-vous/{idRendezVous}")
    public ResponseEntity<Void> cancelRendezVous(@PathVariable Long idRendezVous) {
        log.info("Annulation du rendez-vous: {}", idRendezVous);
        rendezVousClient.cancelRendezVous(idRendezVous);
        return ResponseEntity.noContent().build();
    }

    // ==================== HEALTH CHECK ====================

    /**
     * Health check
     * GET /api/patient/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Patient Service is running!");
    }
}
