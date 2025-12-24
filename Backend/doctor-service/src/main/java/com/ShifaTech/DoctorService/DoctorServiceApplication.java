package com.ShifaTech.DoctorService;

import com.ShifaTech.DoctorService.entity.Doctor;
import com.ShifaTech.DoctorService.repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DoctorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoctorServiceApplication.class, args);
        System.out.println("==============================================");
        System.out.println("🚀 DoctorService démarré avec succès!");
        System.out.println("📡 API disponible sur: http://localhost:8080/api/doctors");
        System.out.println("🗄️  phpMyAdmin disponible sur: http://localhost:8081");
        System.out.println("==============================================");
    }

    // Test rapide pour vérifier la connexion et JPA
    @Bean
    CommandLineRunner initDatabase(DoctorRepository repo) {
        return args -> {
            // Vérifier si la base est vide
            if (repo.count() == 0) {
                // Ajouter des données de test
                repo.save(new Doctor(null, "Dr. Nissrine"));
                repo.save(new Doctor(null, "Dr. Ahmed"));
                repo.save(new Doctor(null, "Dr. Fatima"));
                System.out.println("✅ Données de test insérées!");
            }

            System.out.println("📊 Nombre total de docteurs: " + repo.count());

            // Afficher tous les docteurs
            System.out.println("👨‍⚕️ Liste des docteurs:");
            repo.findAll().forEach(doctor ->
                    System.out.println("  - " + doctor.getName() + " (ID: " + doctor.getId() + ")")
            );
        };
    }
}