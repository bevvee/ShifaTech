package com.ShifaTech.DoctorService.config;

import com.ShifaTech.DoctorService.entity.Doctor;
import com.ShifaTech.DoctorService.entity.DoctorSpeciality;
import com.ShifaTech.DoctorService.entity.Planning;
import com.ShifaTech.DoctorService.repository.DoctorRepository;
import com.ShifaTech.DoctorService.repository.DoctorSpecialityRepository;
import com.ShifaTech.DoctorService.repository.PlanningRepository;
import net.datafaker.Faker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Configuration
public class TestDataGenerator {

    private static final Logger logger = LoggerFactory.getLogger(TestDataGenerator.class);

    @Bean
    @Transactional
    public CommandLineRunner generateData(
            DoctorRepository doctorRepository,
            DoctorSpecialityRepository specialityRepository,
            PlanningRepository planningRepository,
            @Value("${app.test-data.specialities.count:5}") int specialityCount,
            @Value("${app.test-data.doctors.count:10}") int doctorCount,
            @Value("${app.test-data.plannings.count-per-doctor:2}") int planningPerDoctorCount
    ) {
        return args -> {
            // Vérification pour ne pas dupliquer les données si elles existent déjà
            if (specialityRepository.count() > 0 || doctorRepository.count() > 0) {
                logger.info("Les données de test existent déjà. Ignorer la génération...");
                return;
            }

            logger.info("Début de la génération des données de test...");
            Faker faker = new Faker(new Locale("fr"));

            // 1. Générer des spécialités
            List<DoctorSpeciality> specialities = new ArrayList<>();
            Set<String> labels = new HashSet<>();
            
            while(specialities.size() < specialityCount) {
                String label = faker.options().option(
                    "Cardiologie", "Neurologie", "Pédiatrie", "Oncologie",
                    "Dermatologie", "Gynécologie", "Psychiatrie", "Chirurgie",
                    "Orthopédie", "Ophtalmologie", "Radiologie", "Urologie"
                );
                
                // Assurer que les labels sont uniques au minimum (ou simplement accepter plusieurs avec même nom si besoin)
                if(labels.add(label)) {
                    DoctorSpeciality spec = new DoctorSpeciality();
                    spec.setLabel(label);
                    spec.setIdService(faker.number().numberBetween(1L, 20L));
                    specialities.add(spec);
                }
                
                if (labels.size() == 12) break; // Seulement 12 options disponibles
            }
            // Batch Insert
            specialities = specialityRepository.saveAll(specialities);
            logger.info("{} spécialités générées.", specialities.size());

            // 2. Générer des docteurs
            List<Doctor> doctors = new ArrayList<>();
            long startUserId = 1001L; // IDs prévisibles pour correspondre au script SQL (1001 à 1050)
            for (int i = 0; i < doctorCount; i++) {
                Doctor doctor = new Doctor();
                // FK vers le Auth Service
                doctor.setIdUser(startUserId + i);
                doctor.setNumeroOrdre(faker.idNumber().valid());
                
                DoctorSpeciality randomSpec = specialities.get(faker.number().numberBetween(0, specialities.size()));
                doctor.setSpecialite(randomSpec);
                doctors.add(doctor);
            }
            // Batch Insert
            doctors = doctorRepository.saveAll(doctors);
            logger.info("{} docteurs générés.", doctors.size());

            // 3. Générer des plannings (Relations)
            List<Planning> plannings = new ArrayList<>();
            String[] days = {"Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"};
            
            for (Doctor doctor : doctors) {
                Set<String> docDays = new HashSet<>();
                for (int i = 0; i < planningPerDoctorCount; i++) {
                    String day = days[faker.number().numberBetween(0, days.length)];
                    // Eviter les plannings dupliqués par jour pour un même doc
                    if (!docDays.add(day)) continue; 

                    Planning planning = new Planning();
                    planning.setDoctor(doctor);
                    planning.setJour(day);
                    
                    int startHour = faker.number().numberBetween(7, 10);
                    int endHour = faker.number().numberBetween(15, 18);
                    
                    planning.setHeureDebut(LocalTime.of(startHour, 0));
                    planning.setHeureFin(LocalTime.of(endHour, 0));
                    planning.setPauseDebut(LocalTime.of(12, 0));
                    planning.setPauseFin(LocalTime.of(13, faker.options().option(0, 30)));
                    
                    plannings.add(planning);
                }
            }
            // Batch Insert
            planningRepository.saveAll(plannings);
            logger.info("{} plannings générés.", plannings.size());
            
            logger.info("Génération des données de test terminée avec succès.");
        };
    }
}
