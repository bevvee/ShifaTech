-- ============================================
-- Script d'initialisation de la base de données
-- Patient Service - ShifaTech
-- ============================================

CREATE DATABASE IF NOT EXISTS patientdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE patientdb;

-- ============================================
-- NETTOYAGE : Suppression des anciennes tables (legacy)
-- Ces tables ont été renommées/restructurées.
-- Le DROP IF EXISTS garantit aucune erreur si elles n'existent pas.
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `dossier mediceaux`;
DROP TABLE IF EXISTS `ordonnances`;
DROP TABLE IF EXISTS `affiches`;

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================

-- ============================================
-- Table: PATIENT
-- ============================================
CREATE TABLE IF NOT EXISTS patient (
                                       id_patient BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       id_user BIGINT NOT NULL UNIQUE COMMENT 'Référence vers le service Auth',
                                       num_dossier VARCHAR(50) UNIQUE COMMENT 'Numéro de dossier médical',
    assurance VARCHAR(100) COMMENT 'Nom de l\'assurance',
    numero_assurance VARCHAR(50) COMMENT 'Numéro d\'assurance',
    statut BOOLEAN DEFAULT TRUE COMMENT 'Actif/Inactif',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted_at DATETIME NULL,
    deleted_by BIGINT,
    INDEX idx_id_user (id_user),
    INDEX idx_num_dossier (num_dossier),
    INDEX idx_statut (statut),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: DOSSIER_MEDICAL
-- ============================================
CREATE TABLE IF NOT EXISTS dossier_medical (
                                               id_dossier BIGINT AUTO_INCREMENT PRIMARY KEY,
                                               id_patient BIGINT NOT NULL,
                                               status ENUM('ACTIVE', 'ARCHIVED', 'DECEASED') DEFAULT 'ACTIVE' NOT NULL,
    poids DECIMAL(5,2) COMMENT 'Poids en kg',
    taille DECIMAL(5,2) COMMENT 'Taille en cm',
    groupe_sanguin VARCHAR(5) COMMENT 'Ex: A+, O-, AB+',
    antecedents_medicaux TEXT COMMENT 'Antécédents médicaux du patient',
    allergies TEXT COMMENT 'Liste des allergies',
    pathologies_chroniques TEXT COMMENT 'Pathologies chroniques (diabète, hypertension, etc.)',
    notes TEXT COMMENT 'Observations du médecin',
    diagnostic TEXT COMMENT 'Diagnostic final',
    date_fermeture DATETIME COMMENT 'Date de fermeture du dossier',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at DATETIME NULL,
    INDEX idx_id_patient (id_patient),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: VISITE
-- ============================================
CREATE TABLE IF NOT EXISTS visite (
                                      id_visite BIGINT AUTO_INCREMENT PRIMARY KEY,
                                      id_doctor BIGINT NOT NULL COMMENT 'Référence vers le service Doctor',
                                      id_dossier BIGINT NOT NULL,
                                      status ENUM('OPEN', 'CLOSED', 'CANCELLED') DEFAULT 'OPEN' NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    plan_traitement TEXT NOT NULL COMMENT 'Plan de traitement prévu',
    observations TEXT COMMENT 'Observations complémentaires',
    date_fermeture DATETIME COMMENT 'Date de fermeture de la visite',
    created_by BIGINT,
    updated_by BIGINT,
    INDEX idx_id_doctor (id_doctor),
    INDEX idx_id_dossier (id_dossier),
    INDEX idx_status (status),
    INDEX idx_date_creation (date_creation)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: ORDONNANCE
-- ============================================
CREATE TABLE IF NOT EXISTS ordonnance (
                                          id_ordonnance BIGINT AUTO_INCREMENT PRIMARY KEY,
                                          id_patient BIGINT NOT NULL,
                                          id_doctor BIGINT NOT NULL COMMENT 'Référence vers le service Doctor',
                                          id_visite BIGINT COMMENT 'Lien optionnel vers une visite',
                                          date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          description TEXT COMMENT 'Description de l\'ordonnance',
    medicaments TEXT NOT NULL COMMENT 'Liste des médicaments (JSON ou texte formaté)',
    posologie TEXT COMMENT 'Posologie détaillée',
    duree_traitement VARCHAR(50) COMMENT 'Durée du traitement (ex: 7 jours)',
    instructions TEXT COMMENT 'Instructions particulières',
    date_validite DATETIME COMMENT 'Date de validité de l\'ordonnance',
    statut VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'ACTIVE, EXPIRED, CANCELLED',
    created_by BIGINT,
    updated_by BIGINT,
    INDEX idx_id_patient (id_patient),
    INDEX idx_id_doctor (id_doctor),
    INDEX idx_id_visite (id_visite),
    INDEX idx_date_creation (date_creation),
    INDEX idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Données de test (optionnel)
-- ============================================
-- Décommenter pour insérer des données de test

-- INSERT INTO patient (id_user, num_dossier, poids, taille, groupe_sanguin, statut)
-- VALUES
-- (1, 'DOSS-20260214-A1B2', 75.5, 178.0, 'A+', TRUE),
-- (2, 'DOSS-20260214-C3D4', 62.0, 165.0, 'O-', TRUE),
-- (3, 'DOSS-20260214-E5F6', 88.3, 182.5, 'B+', TRUE);

-- ============================================
-- Fin du script
-- ============================================