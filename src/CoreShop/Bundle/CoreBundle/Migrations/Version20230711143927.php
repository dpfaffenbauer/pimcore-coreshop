<?php

declare(strict_types=1);

namespace CoreShop\Bundle\CoreBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230711143927 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("            
            ALTER TABLE coreshop_product_store_values ADD taxRuleId INT DEFAULT NULL;
            ALTER TABLE coreshop_product_store_values ADD CONSTRAINT FK_9EED0E97AC7C6E20 FOREIGN KEY (taxRuleId) REFERENCES coreshop_tax_rule_group (id);
            CREATE INDEX IDX_9EED0E97AC7C6E20 ON coreshop_product_store_values (taxRuleId);
        ");
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
