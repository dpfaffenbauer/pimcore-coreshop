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

namespace CoreShop\Component\Core\Cart\Rule\Applier;

use CoreShop\Component\Core\Product\ProductTaxCalculatorFactoryInterface;
use CoreShop\Component\Core\Provider\AddressProviderInterface;
use CoreShop\Component\Order\Cart\CartContextResolverInterface;
use CoreShop\Component\Order\Distributor\ProportionalIntegerDistributor;
use CoreShop\Component\Order\Factory\AdjustmentFactoryInterface;
use CoreShop\Component\Order\Model\AdjustmentInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Model\PriceRuleItemInterface;
use CoreShop\Component\Taxation\Calculator\TaxCalculatorInterface;
use CoreShop\Component\Taxation\Collector\TaxCollectorInterface;
use Pimcore\Model\DataObject\Fieldcollection;

class CartRuleApplier implements CartRuleApplierInterface
{
    public function __construct(
        private ProportionalIntegerDistributor $distributor,
        private ProductTaxCalculatorFactoryInterface $taxCalculatorFactory,
        private TaxCollectorInterface $taxCollector,
        private AddressProviderInterface $defaultAddressProvider,
        private AdjustmentFactoryInterface $adjustmentFactory,
        private CartContextResolverInterface $cartContextResolver,
    ) {
    }

    public function applyDiscount(
        OrderInterface $cart,
        PriceRuleItemInterface $cartPriceRuleItem,
        int $discount,
        bool $withTax = false,
        bool $includeNonDiscountableItems = false,
    ): void {
        $this->apply($cart, $cartPriceRuleItem, $discount, $withTax, false, $includeNonDiscountableItems);
    }

    public function applySurcharge(
        OrderInterface $cart,
        PriceRuleItemInterface $cartPriceRuleItem,
        int $discount,
        bool $withTax = false,
        bool $includeNonDiscountableItems = false,
    ): void {
        $this->apply($cart, $cartPriceRuleItem, $discount, $withTax, true, $includeNonDiscountableItems);
    }

    protected function apply(
        OrderInterface $cart,
        PriceRuleItemInterface $cartPriceRuleItem,
        int $discount,
        bool $withTax = false,
        bool $positive = false,
        bool $includeNonDiscountableItems = false
    ): void {
        $context = $this->cartContextResolver->resolveCartContext($cart);
        $totalAmount = [];
        $totalDiscountPossible = 0;

        $discountableItems = $includeNonDiscountableItems ? $cart->getItems() : $this->getDiscountableItems($cart);

        if (count($discountableItems) === 0) {
            return;
        }

        foreach ($discountableItems as $item) {
            $totalAmount[] = $item->getTotal(false);
            $totalDiscountPossible += $item->getTotal($withTax);
        }

        //Don't apply less than the cart is worth
        if (!$positive) {
            $discount = min($discount, $totalDiscountPossible);
        }

        if (0 === $discount) {
            return;
        }

        $distributedAmount = $this->distributor->distribute($totalAmount, $discount);

        $totalDiscountFloat = 0;
        $totalDiscountNet = 0;
        $totalDiscountGross = 0;
        $i = 0;

        foreach ($discountableItems as $item) {
            $applicableAmount = $distributedAmount[$i++];

            $itemDiscountGross = 0;
            $itemDiscountNet = 0;

            if (0 === $applicableAmount) {
                continue;
            }

            if ($withTax) {
                $itemDiscountGross = $applicableAmount;
            } else {
                $itemDiscountNet = $applicableAmount;
            }

            $taxCalculator = $this->taxCalculatorFactory->getTaxCalculator(
                $item->getProduct(),
                $cart->getShippingAddress() ?: $this->defaultAddressProvider->getAddress($cart),
                $context,
            );

            if ($taxCalculator instanceof TaxCalculatorInterface) {
                if ($withTax) {
                    $discountFloat = $applicableAmount / (1 + $taxCalculator->getTotalRate() / 100);
                    $itemDiscountNet = $discountFloat;
                } else {
                    $discountFloat = $applicableAmount * (1 + ($taxCalculator->getTotalRate() / 100));
                    $itemDiscountGross = $discountFloat;
                }
            } else {
                if ($withTax) {
                    $itemDiscountNet = $applicableAmount;
                    $discountFloat = $applicableAmount;
                } else {
                    $itemDiscountGross = $applicableAmount;
                    $discountFloat = $applicableAmount;
                }
            }

            $totalDiscountFloat += $discountFloat;
            $totalDiscountNet += $itemDiscountNet;
            $totalDiscountGross += $itemDiscountGross;
        }

        $totalDiscountNet = (int)round($totalDiscountNet);
        $totalDiscountGross = (int)round($totalDiscountGross);
        $totalDiscountFloat = (int)round($totalDiscountFloat);

        //Add missing cents caused by rounding issues
        if ($totalDiscountFloat > ($withTax ? $totalDiscountNet : $totalDiscountGross)) {
            if ($withTax) {
                $totalDiscountNet += $totalDiscountFloat - $totalDiscountNet;
            } else {
                $totalDiscountGross += $totalDiscountFloat - $totalDiscountGross;
            }
        }

        $totalAmountNet = [];
        $totalAmountGross = [];

        foreach ($discountableItems as $item) {
            $totalAmountNet[] = $item->getTotal(false);
            $totalAmountGross[] = $item->getTotal(true);
        }

        $distributedAmountNet = $this->distributor->distribute($totalAmountNet, $totalDiscountNet);
        $distributedAmountGross = $this->distributor->distribute($totalAmountGross, $totalDiscountGross);

        foreach ($discountableItems as $index => $item) {
            $amountNet = $distributedAmountNet[$index];
            $amountGross = $distributedAmountGross[$index];

            if ($amountNet === 0) {
                continue;
            }

            $taxCalculator = $this->taxCalculatorFactory->getTaxCalculator(
                $item->getProduct(),
                $cart->getShippingAddress() ?: $this->defaultAddressProvider->getAddress($cart),
                $context,
            );

            if ($taxCalculator instanceof TaxCalculatorInterface) {
                $taxItems = $item->getTaxes() ?? new Fieldcollection();

                if ($withTax) {
                    /** @psalm-suppress InvalidArgument */
                    $taxItems->setItems(
                        $this->taxCollector->collectTaxesFromGross(
                            $taxCalculator,
                            ($positive ? $amountGross : -1 * $amountGross),
                            $taxItems->getItems(),
                        ),
                    );
                } else {
                    /** @psalm-suppress InvalidArgument */
                    $taxItems->setItems(
                        $this->taxCollector->collectTaxes(
                            $taxCalculator,
                            ($positive ? $amountNet : -1 * $amountNet),
                            $taxItems->getItems(),
                        ),
                    );
                }
            }

            /*
             * https://github.com/coreshop/CoreShop/issues/2572
             *
             * Since we are applying the discount to the cart,
             * we add the adjustment to the cart-item as neutral.
             *
             * we need this adjustment so we know how much to refund or credit.
             */
            $item->addAdjustment($this->adjustmentFactory->createWithData(
                AdjustmentInterface::CART_PRICE_RULE,
                $cartPriceRuleItem->getCartPriceRule()->getName(),
                $positive ? $amountGross : (-1 * $amountGross),
                $positive ? $amountNet : (-1 * $amountNet),
                true,
            ));
        }

        $cartPriceRuleItem->setDiscount($positive ? $totalDiscountNet : (-1 * $totalDiscountNet), false);
        $cartPriceRuleItem->setDiscount($positive ? $totalDiscountGross : (-1 * $totalDiscountGross), true);

        $cart->addAdjustment(
            $this->adjustmentFactory->createWithData(
                AdjustmentInterface::CART_PRICE_RULE,
                $cartPriceRuleItem->getCartPriceRule()->getName(),
                $cartPriceRuleItem->getDiscount(true),
                $cartPriceRuleItem->getDiscount(false),
            ),
        );
    }

    protected function getDiscountableItems(OrderInterface $order)
    {
        $discountableItems = [];
        foreach ($order->getItems() as $item) {
            if ($item->getTotal() <= 0) {
                continue;
            }
            
            if (null === $item->findAttribute('not_discountable')) {
                $discountableItems[] = $item;
            }
        }

        return $discountableItems;
    }
}
