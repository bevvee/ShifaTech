<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251229190240 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE affiche (id INT AUTO_INCREMENT NOT NULL, id_patient INT NOT NULL, id_docteur INT DEFAULT NULL, date_creation DATETIME DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE dossier_medical (id_dossier INT AUTO_INCREMENT NOT NULL, id_patient INT DEFAULT NULL, id_docteur INT DEFAULT NULL, date_creation DATETIME DEFAULT NULL, date_fermeture DATETIME DEFAULT NULL, notes LONGTEXT DEFAULT NULL, diagnostic LONGTEXT DEFAULT NULL, id_ordonance INT DEFAULT NULL, PRIMARY KEY(id_dossier)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE infirmier (id_infirmier INT AUTO_INCREMENT NOT NULL, id_specialite INT NOT NULL, id_utilisateur INT NOT NULL, id_service INT NOT NULL, INDEX IDX_BFEC55B9425C7C16 (id_specialite), PRIMARY KEY(id_infirmier)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE infirmier_specialite (id_specialite INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) NOT NULL, PRIMARY KEY(id_specialite)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE service (id_service INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id_service)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE infirmier ADD CONSTRAINT FK_BFEC55B9425C7C16 FOREIGN KEY (id_specialite) REFERENCES infirmier_specialite (id_specialite)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE infirmier DROP FOREIGN KEY FK_BFEC55B9425C7C16');
        $this->addSql('DROP TABLE affiche');
        $this->addSql('DROP TABLE dossier_medical');
        $this->addSql('DROP TABLE infirmier');
        $this->addSql('DROP TABLE infirmier_specialite');
        $this->addSql('DROP TABLE service');
    }
}
