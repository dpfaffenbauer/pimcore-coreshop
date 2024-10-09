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

namespace CoreShop\Component\Order\Calculator;

use CoreShop\Component\Order\Model\OrderItemAttributeInterface;
use CoreShop\Component\Order\Model\PurchasableInterface;
use CoreShop\Component\Registry\PrioritizedServiceRegistryInterface;
use Webmozart\Assert\Assert;

class CompositePurchasableCustomAttributesCalculator implements PurchasableCustomAttributesCalculatorInterface
{
    public function __construct(
        protected PrioritizedServiceRegistryInterface $customAttributeCalculators,
    ) {
    }

    public function getCustomAttributes(PurchasableInterface $purchasable, array $context): array
    {
        $customAttributes = [];

        /**
         * @var PurchasableCustomAttributesCalculatorInterface $calculator
         */
        foreach ($this->customAttributeCalculators->all() as $calculator) {
            $attributes = $calculator->getCustomAttributes($purchasable, $context);

            Assert::allIsInstanceOf($attributes, OrderItemAttributeInterface::class);

            $customAttributes += $attributes;
        }

        return $customAttributes;
    }
}
