<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251220223533 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE docteur (id_docteur INT AUTO_INCREMENT NOT NULL, numero_ordre VARCHAR(50) NOT NULL, id_utilisateur INT NOT NULL, id_specialite INT DEFAULT NULL, id_service INT NOT NULL, INDEX IDX_83A7A43950EAE44 (id_utilisateur), INDEX IDX_83A7A439425C7C16 (id_specialite), INDEX IDX_83A7A4393F0033A2 (id_service), PRIMARY KEY (id_docteur)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE docteur_specialite (id_specialite INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) NOT NULL, PRIMARY KEY (id_specialite)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE dossier_medical (id INT AUTO_INCREMENT NOT NULL, date_creation DATETIME NOT NULL, date_fermeture DATETIME DEFAULT NULL, notes LONGTEXT DEFAULT NULL, diagnostic LONGTEXT DEFAULT NULL, id_patient INT NOT NULL, id_docteur INT DEFAULT NULL, INDEX IDX_3581EE62C4477E9B (id_patient), INDEX IDX_3581EE625D3A0D49 (id_docteur), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE infirmier (id_infirmier INT AUTO_INCREMENT NOT NULL, id_utilisateur INT NOT NULL, id_service INT DEFAULT NULL, id_infirmierSp INT DEFAULT NULL, UNIQUE INDEX UNIQ_BFEC55B950EAE44 (id_utilisateur), INDEX IDX_BFEC55B93F0033A2 (id_service), INDEX IDX_BFEC55B9B65EAFC5 (id_infirmierSp), PRIMARY KEY (id_infirmier)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE infirmier_specialite (id_infirmierSp INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) NOT NULL, PRIMARY KEY (id_infirmierSp)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE patient (id_patient INT AUTO_INCREMENT NOT NULL, num_dossier VARCHAR(50) DEFAULT NULL, id_utilisateur INT NOT NULL, INDEX IDX_1ADAD7EB50EAE44 (id_utilisateur), PRIMARY KEY (id_patient)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE rendez_vous (id_rdv INT AUTO_INCREMENT NOT NULL, date_rdv DATETIME NOT NULL, statut VARCHAR(20) NOT NULL, created_at DATETIME DEFAULT NULL, created_by INT NOT NULL, updated_at DATETIME DEFAULT NULL, updated_by INT DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, deleted_by INT DEFAULT NULL, heur_rdv TIME NOT NULL, id_patient INT NOT NULL, id_docteur INT NOT NULL, INDEX IDX_65E8AA0AC4477E9B (id_patient), INDEX IDX_65E8AA0A5D3A0D49 (id_docteur), PRIMARY KEY (id_rdv)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE service (id_service INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) NOT NULL, description VARCHAR(255) DEFAULT NULL, PRIMARY KEY (id_service)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE utilisateur (id_utilisateur INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, cin VARCHAR(15) NOT NULL, email VARCHAR(150) NOT NULL, mot_de_passe VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL, sexe VARCHAR(1) NOT NULL, statut TINYINT DEFAULT NULL, created_at DATETIME NOT NULL, created_by INT NOT NULL, UNIQUE INDEX UNIQ_1D1C63B3ABE530DA (cin), UNIQUE INDEX UNIQ_1D1C63B3E7927C74 (email), PRIMARY KEY (id_utilisateur)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE docteur ADD CONSTRAINT FK_83A7A43950EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateur (id_utilisateur)');
        $this->addSql('ALTER TABLE docteur ADD CONSTRAINT FK_83A7A439425C7C16 FOREIGN KEY (id_specialite) REFERENCES docteur_specialite (id_specialite)');
        $this->addSql('ALTER TABLE docteur ADD CONSTRAINT FK_83A7A4393F0033A2 FOREIGN KEY (id_service) REFERENCES service (id_service)');
        $this->addSql('ALTER TABLE dossier_medical ADD CONSTRAINT FK_3581EE62C4477E9B FOREIGN KEY (id_patient) REFERENCES patient (id_patient)');
        $this->addSql('ALTER TABLE dossier_medical ADD CONSTRAINT FK_3581EE625D3A0D49 FOREIGN KEY (id_docteur) REFERENCES docteur (id_docteur)');
        $this->addSql('ALTER TABLE infirmier ADD CONSTRAINT FK_BFEC55B950EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateur (id_utilisateur)');
        $this->addSql('ALTER TABLE infirmier ADD CONSTRAINT FK_BFEC55B93F0033A2 FOREIGN KEY (id_service) REFERENCES service (id_service)');
        $this->addSql('ALTER TABLE infirmier ADD CONSTRAINT FK_BFEC55B9B65EAFC5 FOREIGN KEY (id_infirmierSp) REFERENCES infirmier_specialite (id_infirmierSp)');
        $this->addSql('ALTER TABLE patient ADD CONSTRAINT FK_1ADAD7EB50EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateur (id_utilisateur)');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0AC4477E9B FOREIGN KEY (id_patient) REFERENCES patient (id_patient)');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0A5D3A0D49 FOREIGN KEY (id_docteur) REFERENCES docteur (id_docteur)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE docteur DROP FOREIGN KEY FK_83A7A43950EAE44');
        $this->addSql('ALTER TABLE docteur DROP FOREIGN KEY FK_83A7A439425C7C16');
        $this->addSql('ALTER TABLE docteur DROP FOREIGN KEY FK_83A7A4393F0033A2');
        $this->addSql('ALTER TABLE dossier_medical DROP FOREIGN KEY FK_3581EE62C4477E9B');
        $this->addSql('ALTER TABLE dossier_medical DROP FOREIGN KEY FK_3581EE625D3A0D49');
        $this->addSql('ALTER TABLE infirmier DROP FOREIGN KEY FK_BFEC55B950EAE44');
        $this->addSql('ALTER TABLE infirmier DROP FOREIGN KEY FK_BFEC55B93F0033A2');
        $this->addSql('ALTER TABLE infirmier DROP FOREIGN KEY FK_BFEC55B9B65EAFC5');
        $this->addSql('ALTER TABLE patient DROP FOREIGN KEY FK_1ADAD7EB50EAE44');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0AC4477E9B');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A5D3A0D49');
        $this->addSql('DROP TABLE docteur');
        $this->addSql('DROP TABLE docteur_specialite');
        $this->addSql('DROP TABLE dossier_medical');
        $this->addSql('DROP TABLE infirmier');
        $this->addSql('DROP TABLE infirmier_specialite');
        $this->addSql('DROP TABLE patient');
        $this->addSql('DROP TABLE rendez_vous');
        $this->addSql('DROP TABLE service');
        $this->addSql('DROP TABLE utilisateur');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
