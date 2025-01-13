<?php

declare(strict_types=1);

/*
 * CoreShop
 *
 * This source file is available under two different licenses:
 *  - GNU General Public License version 3 (GPLv3)
 *  - CoreShop Commercial License (CCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */

namespace CoreShop\Bundle\CoreBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

final class Version20230711144054 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $productClass = $this->container->getParameter('coreshop.model.product.class');
        $tmpProduct = new $productClass();
        $productClassId = $tmpProduct->getClassId();

        $productIds = $this->connection->fetchAllAssociative('SELECT oo_id, taxRule FROM object_query_' . $productClassId);

        foreach ($productIds as $id) {
            $this->addSql('UPDATE coreshop_product_store_values SET taxRuleId = :taxRuleId WHERE product = :product', ['product' => $id['oo_id'], 'taxRuleId' => $id['taxRule']]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
