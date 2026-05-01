<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260425000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add missing id_service column to infirmier table';
    }

    public function up(Schema $schema): void
    {
        // Add id_service only if the column does not already exist
        $this->addSql("
            SET @col_exists = (
                SELECT COUNT(*) FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'infirmier'
                  AND COLUMN_NAME = 'id_service'
            )
        ");
        $this->addSql("
            SET @sql = IF(
                @col_exists = 0,
                'ALTER TABLE infirmier ADD COLUMN id_service INT DEFAULT NULL',
                'SELECT 1'
            )
        ");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE infirmier DROP COLUMN IF EXISTS id_service');
    }
}
