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
use CoreShop\Component\Core\Model\QuantityRangeInterface;
use CoreShop\Component\ProductQuantityPriceRules\Model\ProductQuantityPriceRuleInterface;
use CoreShop\Component\ProductQuantityPriceRules\Repository\ProductQuantityPriceRuleRepositoryInterface;
use Webmozart\Assert\Assert;

final class ProductQuantityPriceRuleContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ProductQuantityPriceRuleRepositoryInterface $productQuantityPriceRuleRepository,
    ) {
    }

    /**
     * @Transform /^quantity price rule "([^"]+)"$/
     */
    public function getProductQuantityPriceRuleByProductAndName($ruleName): ProductQuantityPriceRuleInterface
    {
        $rule = $this->productQuantityPriceRuleRepository->findOneBy(['name' => $ruleName]);

        Assert::isInstanceOf($rule, ProductQuantityPriceRuleInterface::class);

        return $rule;
    }

    /**
     * @Transform /^(quantity price rule)$/
     */
    public function getLatestSpecificProductQuantityPriceRule(): ProductQuantityPriceRuleInterface
    {
        $resource = $this->sharedStorage->get('product-quantity-price-rule');

        Assert::isInstanceOf($resource, ProductQuantityPriceRuleInterface::class);

        return $resource;
    }

    /**
     * @Transform /^(price range)$/
     */
    public function getPriceRange(): QuantityRangeInterface
    {
        $resource = $this->sharedStorage->get('quantity-price-rule-range');

        Assert::isInstanceOf($resource, QuantityRangeInterface::class);

        return $resource;
    }
}
