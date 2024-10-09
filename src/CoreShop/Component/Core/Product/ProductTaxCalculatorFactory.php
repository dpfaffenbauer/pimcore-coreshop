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

namespace CoreShop\Component\Core\Product;

use CoreShop\Component\Address\Model\AddressInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Taxation\TaxCalculatorFactoryInterface;
use CoreShop\Component\Order\Model\PurchasableInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use CoreShop\Component\Taxation\Calculator\TaxCalculatorInterface;
use CoreShop\Component\Taxation\Model\TaxRuleGroupInterface;

class ProductTaxCalculatorFactory implements ProductTaxCalculatorFactoryInterface
{
    public function __construct(
        private TaxCalculatorFactoryInterface $taxCalculatorFactory,
    ) {
    }

    public function getTaxCalculator(
        PurchasableInterface $product,
        AddressInterface $address,
        array $context = [],
    ): ?TaxCalculatorInterface {
        $store = $context['store'] ?? null;
        $taxRuleGroup = null;

        if ($product instanceof ProductInterface && $store instanceof StoreInterface) {
            $storeValues = $product->getStoreValuesForStore($store);

            $taxRuleGroup = $storeValues?->getTaxRule();
        }

        if (null === $taxRuleGroup && method_exists($product, 'getTaxRule')) {
            $taxRuleGroup = $product->getTaxRule();
        }

        if ($taxRuleGroup instanceof TaxRuleGroupInterface) {
            return $this->taxCalculatorFactory->getTaxCalculatorForAddress($taxRuleGroup, $address, $context);
        }

        return null;
    }
}
