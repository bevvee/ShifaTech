package com.shifatech.authservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Locale;

/**
 * Seeds auth_db with fake users whose idUser values are synced with other services:
 *
 *  idUser =   1          → ADMIN
 *  idUser = 101 – 120    → PATIENT  (matches patient-service DataSeeder loop 101 → 120)
 *  idUser = 201 – 210    → INFIRMIER
 *  idUser = 1001 – 1010  → DOCTEUR  (matches doctor-service TestDataGenerator startUserId = 1001)
 *
 * Uses JdbcTemplate for native SQL inserts to force explicit id_user values,
 * bypassing Hibernate's IDENTITY generation strategy.
 * All passwords = "password123" (bcrypt-encoded at startup).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    private final Faker faker = new Faker(new Locale("fr"));

    private static final String INSERT_SQL = """
            INSERT INTO users
              (id_user, nom, prenom, cin, email, mot_de_passe, role, sexe, statut,
               date_naissance, telephone, adresse, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            """;

    private static final String EXISTS_SQL =
            "SELECT COUNT(*) FROM users WHERE id_user = ?";

    @Override
    public void run(String... args) {
        log.info("=== Auth DataSeeder : début du seeding ===");

        final String pwd = passwordEncoder.encode("password123");

        // ── 1. ADMIN (idUser = 1) ────────────────────────────────────────────
        seed(1, "Système", "Admin", "ADMIN001", "admin@shifa.tech",
                pwd, "ADMIN", "M", LocalDate.of(1985, 1, 1),
                "0600000001", "Clinique ShifaTech, Rabat");

        // ── 2. PATIENTS (idUser = 101–120) → matches patient-service loop ────
        for (int i = 101; i <= 120; i++) {
            String sexe  = (i % 2 == 0) ? "F" : "M";
            String first = sexe.equals("F") ? faker.name().femaleFirstName() : faker.name().maleFirstName();
            seed(i,
                    faker.name().lastName(), first,
                    "PATC" + String.format("%04d", i),
                    "patient" + i + "@shifa.tech",
                    pwd, "PATIENT", sexe,
                    randomDob(1950, 50),
                    "0700" + String.format("%06d", i),
                    faker.address().streetAddress() + ", " + faker.address().city());
        }

        // ── 3. INFIRMIERS (idUser = 201–210) ─────────────────────────────────
        for (int i = 201; i <= 210; i++) {
            String sexe  = (i % 2 == 0) ? "F" : "M";
            String first = sexe.equals("F") ? faker.name().femaleFirstName() : faker.name().maleFirstName();
            seed(i,
                    faker.name().lastName(), first,
                    "INFC" + String.format("%04d", i),
                    "infirmier" + i + "@shifa.tech",
                    pwd, "INFIRMIER", sexe,
                    randomDob(1970, 30),
                    "0600" + String.format("%06d", i),
                    faker.address().streetAddress() + ", " + faker.address().city());
        }

        // ── 4. DOCTEURS (idUser = 1001–1010) → matches doctor-service ────────
        for (int i = 1001; i <= 1010; i++) {
            String sexe  = (i % 2 == 0) ? "F" : "M";
            String first = sexe.equals("F") ? faker.name().femaleFirstName() : faker.name().maleFirstName();
            seed(i,
                    faker.name().lastName(), first,
                    "DOCC" + String.format("%04d", i),
                    "docteur" + i + "@shifa.tech",
                    pwd, "DOCTEUR", sexe,
                    randomDob(1960, 30),
                    "0600" + String.format("%06d", i),
                    faker.address().streetAddress() + ", " + faker.address().city());
        }

        log.info("=== Auth DataSeeder : terminé " +
                "(1 admin + 20 patients + 10 infirmiers + 10 docteurs) ===");
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void seed(int idUser, String nom, String prenom, String cin,
                      String email, String password, String role,
                      String sexe, LocalDate dob, String telephone, String adresse) {
        Integer count = jdbc.queryForObject(EXISTS_SQL, Integer.class, idUser);
        if (count != null && count > 0) {
            log.debug("  ⏭  idUser={} existe déjà — saut.", idUser);
            return;
        }
        jdbc.update(INSERT_SQL,
                idUser, nom, prenom, cin, email, password,
                role, sexe, true,
                dob, telephone, adresse);
        log.info("  ✔  Créé : {} {} ({}) [{}]", prenom, nom, email, role);
    }

    private LocalDate randomDob(int baseYear, int spreadYears) {
        return LocalDate.of(
                baseYear + faker.number().numberBetween(0, spreadYears),
                faker.number().numberBetween(1, 13),
                faker.number().numberBetween(1, 28));
    }
}
