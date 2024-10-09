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

namespace CoreShop\Component\Product\Calculator;

use CoreShop\Component\Product\Model\ProductAttribute;
use CoreShop\Component\Product\Model\ProductInterface;
use CoreShop\Component\Registry\PrioritizedServiceRegistryInterface;
use Webmozart\Assert\Assert;

class CompositeProductCustomAttributesCalculator implements ProductCustomAttributesCalculatorInterface
{
    public function __construct(
        protected PrioritizedServiceRegistryInterface $customAttributesCalculator,
    ) {
    }

    public function getCustomAttributes(ProductInterface $product, array $context): array
    {
        $customAttributes = [];

        /**
         * @var ProductCustomAttributesCalculatorInterface $calculator
         */
        foreach ($this->customAttributesCalculator->all() as $calculator) {
            $attributes = $calculator->getCustomAttributes($product, $context);

            Assert::allIsInstanceOf($attributes, ProductAttribute::class);

            $customAttributes += $attributes;
        }

        return $customAttributes;
    }
}
