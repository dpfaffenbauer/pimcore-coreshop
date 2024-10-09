<?php

declare(strict_types=1);

namespace CoreShop\Bundle\CoreBundle\Migrations;

use CoreShop\Component\Pimcore\DataObject\ClassUpdate;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

final class Version20240218161440 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $classUpdater = new ClassUpdate(
            $this->container->getParameter('coreshop.model.order_item.pimcore_class_name'),
        );

        if ($classUpdater->hasField('attributes')) {
            return;
        }

        $attributesField = [
            'name' => 'attributes',
            'title' => 'coreshop.order.attributes',
            'tooltip' => '',
            'mandatory' => false,
            'noteditable' => false,
            'index' => false,
            'locked' => false,
            'style' => '',
            'permissions' => null,
            'fieldtype' => 'fieldcollections',
            'relationType' => false,
            'invisible' => false,
            'visibleGridView' => false,
            'visibleSearch' => false,
            'allowedTypes' => [
                'CoreShopOrderItemAttribute',
            ],
            'lazyLoading' => true,
            'maxItems' => null,
            'disallowAddRemove' => false,
            'disallowReorder' => false,
            'collapsed' => false,
            'collapsible' => false,
            'border' => false,
            'datatype' => 'data',
        ];

        $classUpdater->insertFieldAfter('priceRuleItems', $attributesField);
        $classUpdater->save();
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
