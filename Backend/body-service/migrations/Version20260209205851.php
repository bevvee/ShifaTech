<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260209205851 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE body_parts (id BIGINT AUTO_INCREMENT NOT NULL, code VARCHAR(100) NOT NULL, label VARCHAR(255) NOT NULL, shape_type ENUM(\'path\',\'ellipse\'), coords JSON NOT NULL, clickable TINYINT NOT NULL, body_section_id BIGINT NOT NULL, INDEX IDX_CAA9233640646509 (body_section_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE body_sections (id BIGINT AUTO_INCREMENT NOT NULL, code VARCHAR(50) NOT NULL, name VARCHAR(100) NOT NULL, `order` BIGINT NOT NULL, background_image VARCHAR(255) NOT NULL, width INT DEFAULT NULL, height INT DEFAULT NULL, UNIQUE INDEX UNIQ_3213835077153098 (code), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE body_parts ADD CONSTRAINT FK_CAA9233640646509 FOREIGN KEY (body_section_id) REFERENCES body_sections (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE body_parts DROP FOREIGN KEY FK_CAA9233640646509');
        $this->addSql('DROP TABLE body_parts');
        $this->addSql('DROP TABLE body_sections');
    }
}
