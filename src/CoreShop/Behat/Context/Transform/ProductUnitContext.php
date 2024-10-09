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

namespace CoreShop\Behat\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\Product\Repository\ProductUnitRepositoryInterface;
use Webmozart\Assert\Assert;

final class ProductUnitContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ProductUnitRepositoryInterface $unitRepository,
    ) {
    }

    /**
     * @Transform /^unit "([^"]+)"$/
     * @Transform /^product-unit "([^"]+)"$/
     */
    public function getUnitByName(string $name): ProductUnitInterface
    {
        $unit = $this->unitRepository->findByName($name);

        Assert::isInstanceOf($unit, ProductUnitInterface::class);

        return $unit;
    }

    /**
     * @Transform /^unit/
     * @Transform /^product-unit/
     */
    public function unit(): ProductUnitInterface
    {
        return $this->sharedStorage->get('product-unit');
    }
}
