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
use CoreShop\Component\Product\Model\ProductSpecificPriceRuleInterface;
use CoreShop\Component\Product\Repository\ProductSpecificPriceRuleRepositoryInterface;
use Webmozart\Assert\Assert;

final class ProductSpecificPriceRuleContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ProductSpecificPriceRuleRepositoryInterface $productSpecificPriceRuleRepository,
    ) {
    }

    /**
     * @Transform /^specific price rule "([^"]+)"$/
     */
    public function getPriceRuleByProductAndName(string $ruleName): ProductSpecificPriceRuleInterface
    {
        $rule = $this->productSpecificPriceRuleRepository->findOneBy(['name' => $ruleName]);

        Assert::isInstanceOf($rule, ProductSpecificPriceRuleInterface::class);

        return $rule;
    }

    /**
     * @Transform /^(specific price rule)$/
     */
    public function getLatestSpecificPriceRule(): ProductSpecificPriceRuleInterface
    {
        $resource = $this->sharedStorage->getLatestResource();

        Assert::isInstanceOf($resource, ProductSpecificPriceRuleInterface::class);

        return $resource;
    }
}
