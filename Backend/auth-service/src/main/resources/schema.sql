-- 1_initial_schema.sql (Flyway / migration)
-- USERS table
CREATE TABLE users (
                       id_user INT AUTO_INCREMENT PRIMARY KEY,
                       nom VARCHAR(100) NOT NULL,
                       prenom VARCHAR(100) NOT NULL,
                       cin VARCHAR(15) NOT NULL,
                       email VARCHAR(150) NOT NULL,
                       mot_de_passe VARCHAR(255) NOT NULL,
                       role ENUM('ADMIN','DOCTEUR','INFIRMIER','PATIENT') NOT NULL,
                       sexe ENUM('M','F'),
                       statut BOOLEAN NOT NULL DEFAULT FALSE,
                       date_naissance DATE,
                       telephone VARCHAR(20) NOT NULL,
                       adresse VARCHAR(255),
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       created_by INT,
                       updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                       updated_by INT,
                       deleted_at DATETIME DEFAULT NULL,
                       deleted_by INT,

    -- Unique constraints
                       UNIQUE KEY uq_users_cin (cin),
                       UNIQUE KEY uq_users_email (email),
                       UNIQUE KEY uq_users_telephone (telephone),

    -- Indexes
                       INDEX idx_users_email (email),
                       INDEX idx_users_cin (cin)
) ENGINE=InnoDB;
CREATE TABLE password_reset_tokens (
                                       id INT AUTO_INCREMENT PRIMARY KEY,
                                       token VARCHAR(255) NOT NULL,
                                       user_id INT NOT NULL,
                                       expiry_date DATETIME NOT NULL,
                                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
                                       CONSTRAINT fk_password_reset_user
                                           FOREIGN KEY (user_id)
                                               REFERENCES users(id_user)
                                               ON DELETE CASCADE
) ENGINE=InnoDB;