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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use Doctrine\Persistence\ObjectManager;

final class ProductUnitContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FactoryInterface $productUnitFactory,
    ) {
    }

    /**
     * @Given /^the site has a product-unit "([^"]+)"$/
     */
    public function thereIsAProductUnit($name): void
    {
        /**
         * @var ProductUnitInterface $unit
         */
        $unit = $this->productUnitFactory->createNew();

        $unit->setName($name);
        $unit->setFullLabel($name, 'en');
        $unit->setFullPluralLabel($name, 'en');
        $unit->setShortLabel($name, 'en');
        $unit->setShortPluralLabel($name, 'en');

        $this->objectManager->persist($unit);
        $this->objectManager->flush();

        $this->sharedStorage->set('product-unit', $unit);
    }
}
