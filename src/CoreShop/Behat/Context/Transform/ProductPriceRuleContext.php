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
use CoreShop\Component\Product\Model\ProductPriceRuleInterface;
use CoreShop\Component\Product\Repository\ProductPriceRuleRepositoryInterface;
use Webmozart\Assert\Assert;

final class ProductPriceRuleContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ProductPriceRuleRepositoryInterface $productPriceRuleRepository,
    ) {
    }

    /**
     * @Transform /^price rule "([^"]+)"$/
     */
    public function getPriceRuleByProductAndName($ruleName): ProductPriceRuleInterface
    {
        $rule = $this->productPriceRuleRepository->findOneBy(['name' => $ruleName]);

        Assert::isInstanceOf($rule, ProductPriceRuleInterface::class);

        return $rule;
    }

    /**
     * @Transform /^(price rule)$/
     */
    public function getLatestPriceRule(): ProductPriceRuleInterface
    {
        $resource = $this->sharedStorage->getLatestResource();

        Assert::isInstanceOf($resource, ProductPriceRuleInterface::class);

        return $resource;
    }
}
