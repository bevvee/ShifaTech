package com.ShifaTech.DoctorService.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Helper component to drop legacy unique constraints that Hibernate update
 * ddl-auto might leave behind.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DbConstraintFixer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void dropLegacyUniqueConstraint() {
        try {
            log.info("Attempting to drop legacy unique constraint UK8fyln21xrdygbpvpaocuh10ie on DOCTEUR table...");

            // Native query to drop the constraint if it exists
            // In MySQL, unique constraints are often managed as indexes.
            jdbcTemplate.execute("ALTER TABLE DOCTEUR DROP INDEX UK8fyln21xrdygbpvpaocuh10ie");

            log.info("Successfully dropped legacy unique constraint.");
        } catch (Exception e) {
            // It might already be dropped or the name might differ in some environments
            log.warn("Could not drop constraint (it may not exist or name differs): {}", e.getMessage());
        }
    }
}
