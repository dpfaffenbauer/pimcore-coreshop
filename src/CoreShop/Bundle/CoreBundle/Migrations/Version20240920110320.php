<?php

declare(strict_types=1);

namespace CoreShop\Bundle\CoreBundle\Migrations;

use CoreShop\Component\Pimcore\DataObject\ClassUpdate;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

final class Version20240920110320 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $classUpdater = new ClassUpdate(
            $this->container->getParameter('coreshop.model.order.pimcore_class_name'),
        );

        if ($classUpdater->hasField('name')) {
            return;
        }

        $nameField = [
            "name" => "name",
            "title" => "coreshop.order.name",
            "tooltip" => "",
            "mandatory" => false,
            "noteditable" => true,
            "index" => false,
            "locked" => false,
            "style" => "",
            "permissions" => null,
            "fieldtype" => "input",
            "relationType" => false,
            "invisible" => false,
            "visibleGridView" => false,
            "visibleSearch" => false,
            "defaultValue" => null,
            "columnLength" => 190,
            "regex" => "",
            "regexFlags" => [],
            "unique" => false,
            "showCharCount" => false,
            "width" => "",
            "defaultValueGenerator" => "",
            "datatype" => "data",
        ];

        $classUpdater->insertFieldBefore('orderNumber', $nameField);
        $classUpdater->save();
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
