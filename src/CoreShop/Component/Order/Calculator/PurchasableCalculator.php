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

use CoreShop\Component\Order\Exception\NoPurchasableDiscountPriceFoundException;
use CoreShop\Component\Order\Exception\NoPurchasablePriceFoundException;
use CoreShop\Component\Order\Exception\NoPurchasableRetailPriceFoundException;
use CoreShop\Component\Order\Model\PurchasableInterface;

final class PurchasableCalculator implements PurchasableCalculatorInterface
{
    public function __construct(
        private PurchasablePriceCalculatorInterface $purchasablePriceCalculator,
        private PurchasableRetailPriceCalculatorInterface $purchasableRetailPriceCalculator,
        private PurchasableDiscountPriceCalculatorInterface $purchasableDiscountPriceCalculator,
        private PurchasableDiscountCalculatorInterface $purchasableDiscountCalculator,
        private PurchasableCustomAttributesCalculatorInterface $purchasableIsDiscountableCalculator,
    ) {
    }

    public function getPrice(PurchasableInterface $purchasable, array $context, bool $includingDiscounts = false): int
    {
        try {
            return $this->purchasablePriceCalculator->getPrice($purchasable, $context, $includingDiscounts);
        } catch (NoPurchasablePriceFoundException) {
        }

        return 0;
    }

    public function getDiscount(PurchasableInterface $purchasable, array $context, int $basePrice): int
    {
        return $this->purchasableDiscountCalculator->getDiscount($purchasable, $context, $basePrice);
    }

    public function getDiscountPrice(PurchasableInterface $purchasable, array $context): int
    {
        try {
            return $this->purchasableDiscountPriceCalculator->getDiscountPrice($purchasable, $context);
        } catch (NoPurchasableDiscountPriceFoundException) {
        }

        return 0;
    }

    public function getRetailPrice(PurchasableInterface $purchasable, array $context): int
    {
        try {
            return $this->purchasableRetailPriceCalculator->getRetailPrice($purchasable, $context);
        } catch (NoPurchasableRetailPriceFoundException) {
        }

        return 0;
    }

    public function getCustomAttributes(PurchasableInterface $purchasable, array $context): array
    {
        return $this->purchasableIsDiscountableCalculator->getCustomAttributes($purchasable, $context);
    }
}
