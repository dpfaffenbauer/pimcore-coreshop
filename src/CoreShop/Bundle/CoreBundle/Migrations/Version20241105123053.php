<?php

declare(strict_types=1);

namespace CoreShop\Bundle\CoreBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241105123053 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        if ($schema->getTable('coreshop_product_store_values')->hasColumn('fieldName')) {
            return;
        }

        $this->addSql("ALTER TABLE coreshop_product_store_values ADD fieldName VARCHAR(255) NOT NULL;");
        $this->addSql("DROP INDEX product_store ON coreshop_product_store_values;");
        $this->addSql("CREATE UNIQUE INDEX product_store ON coreshop_product_store_values (product, store, fieldName);");
        $this->addSql("UPDATE coreshop_product_store_values SET fieldName='storeValues';");
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
