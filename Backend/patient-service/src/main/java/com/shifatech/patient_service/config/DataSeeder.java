package com.shifatech.patient_service.config;

import com.shifatech.patient_service.entity.*;
import com.shifatech.patient_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final PatientRepository patientRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final VisiteRepository visiteRepository;
    private final OrdonnanceRepository ordonnanceRepository;

    private final Faker faker = new Faker(new Locale("fr"));

    @Override
    public void run(String... args) {
        log.info("Vérification de la base de données pour le seeding...");

        // On génère 20 patients correspondant aux idUser 101 à 120 (du script SQL
        // auth-service)
        for (int i = 101; i <= 120; i++) {
            Long currentIdUser = (long) i;

            // Si le patient pour cet idUser existe déjà, on le saute
            if (patientRepository.existsByIdUser(currentIdUser)) {
                log.debug("Patient pour idUser {} existe déjà. Saut.", currentIdUser);
                continue;
            }

            log.info("Génération de données pour idUser : {}", currentIdUser);
            // 1. Créer le Patient
            Patient patient = new Patient();
            patient.setIdUser((long) i);
            patient.setNumDossier(generateNumDossier());
            patient.setAssurance(faker.options().option("CNOPS", "CNSS", "SAHAM", "AXA"));
            patient.setNumeroAssurance(faker.number().digits(10));
            patient.setStatut(true);
            patient.setCreatedBy(1L); // Admin par défaut

            patient = patientRepository.save(patient);

            // 2. Créer le Dossier Médical
            DossierMedical dossier = new DossierMedical();
            dossier.setIdPatient(patient.getIdPatient());
            dossier.setStatus(DossierMedical.StatusDossier.ACTIVE);
            dossier.setPoids(new BigDecimal(faker.number().randomDouble(1, 50, 100)));
            dossier.setTaille(new BigDecimal(faker.number().randomDouble(1, 150, 195)));
            dossier.setGroupeSanguin(faker.options().option("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"));
            dossier.setAntecedentsMedicaux("Hypertension légère, Asthme dans l'enfance.");
            dossier.setAllergies("Pénicilline, Pollen.");
            dossier.setPathologiesChroniques("Diabète de type 2 (sous contrôle).");
            dossier.setNotes("Patient coopératif. Suivi régulier recommandé.");
            dossier.setCreatedBy(1L);

            dossier = dossierMedicalRepository.save(dossier);

            // 3. Créer 2 Visites par dossier
            for (int v = 1; v <= 2; v++) {
                Visite visite = new Visite();
                visite.setIdDossier(dossier.getIdDossier());
                visite.setIdDoctor(201L + faker.number().numberBetween(0, 4));
                visite.setStatus(v == 1 ? Visite.StatusVisite.CLOSED : Visite.StatusVisite.OPEN);

                // 🎲 Randomisation du type de visite
                if (faker.bool().bool()) {
                    visite.setTypeVisite(TypeVisite.CONSULTATION);
                    visite.setTypeBlessure(null);
                    visite.setIdBodyPart(null);
                    visite.setObservations("Consultation de routine : " + faker.medical().symptoms());
                } else {
                    visite.setTypeVisite(TypeVisite.BLESSURE);
                    visite.setTypeBlessure(faker.options().option(TypeBlessure.class));
                    // On choisit une partie du corps au hasard parmi les 125 existantes dans body-service
                    visite.setIdBodyPart((long) faker.number().numberBetween(1, 126));
                    visite.setObservations("Blessure constatée de type " + visite.getTypeBlessure());
                }

                visite.setPlanTraitement(faker.medical().medicineName() + " : 1 comprimé matin et soir pendant 7 jours.");
                visite.setCreatedBy(1L);
                
                visite = visiteRepository.save(visite);

                // 4. Créer une Ordonnance liée à la visite (si c'est la 1ère visite)
                if (v == 1) {
                    Ordonnance ordonnance = new Ordonnance();
                    ordonnance.setIdPatient(patient.getIdPatient());
                    ordonnance.setIdDoctor(visite.getIdDoctor());
                    ordonnance.setIdVisite(visite.getIdVisite());
                    ordonnance.setMedicaments(faker.medical().medicineName() + ", " + faker.medical().medicineName());
                    ordonnance.setPosologie("1 fois par jour après le repas.");
                    ordonnance.setDureeTraitement("10 jours");
                    ordonnance.setDescription("Ordonnance générée suite à la visite de contrôle.");
                    ordonnance.setStatut(com.shifatech.patient_service.entity.StatusOrdonnance.ACTIVE);
                    ordonnance.setCreatedBy(1L);

                    ordonnanceRepository.save(ordonnance);
                }
            }
        }

        log.info(
                "Génération des données de test terminée avec succès : 20 patients, 20 dossiers, 40 visites et 20 ordonnances.");
    }

    private String generateNumDossier() {
        String date = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        String random = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return String.format("DOSS-%s-%s", date, random);
    }
}
