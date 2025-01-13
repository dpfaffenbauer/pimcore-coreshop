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

namespace CoreShop\Component\Product\Rule\Calculator;

use CoreShop\Component\Product\Calculator\ProductCustomAttributesCalculatorInterface;
use CoreShop\Component\Product\Calculator\ProductDiscountCalculatorInterface;
use CoreShop\Component\Product\Calculator\ProductDiscountPriceCalculatorInterface;
use CoreShop\Component\Product\Calculator\ProductRetailPriceCalculatorInterface;
use CoreShop\Component\Product\Exception\NoDiscountPriceFoundException;
use CoreShop\Component\Product\Exception\NoRetailPriceFoundException;
use CoreShop\Component\Product\Model\PriceRuleInterface;
use CoreShop\Component\Product\Model\ProductInterface;
use CoreShop\Component\Product\Rule\Action\ProductCustomAttributesActionProcessorInterface;
use CoreShop\Component\Product\Rule\Action\ProductDiscountActionProcessorInterface;
use CoreShop\Component\Product\Rule\Action\ProductDiscountPriceActionProcessorInterface;
use CoreShop\Component\Product\Rule\Action\ProductPriceActionProcessorInterface;
use CoreShop\Component\Product\Rule\Fetcher\ValidRulesFetcherInterface;
use CoreShop\Component\Registry\ServiceRegistryInterface;
use CoreShop\Component\Rule\Model\ActionInterface;

final class ProductPriceRuleCalculator implements
    ProductDiscountCalculatorInterface,
    ProductRetailPriceCalculatorInterface,
    ProductDiscountPriceCalculatorInterface,
    ProductCustomAttributesCalculatorInterface
{
    public function __construct(
        private ValidRulesFetcherInterface $validRulesFetcher,
        private ServiceRegistryInterface $actionServiceRegistry,
    ) {
    }

    public function getRetailPrice(ProductInterface $product, array $context): int
    {
        $price = null;

        /**
         * @var PriceRuleInterface[] $rules
         */
        $rules = $this->validRulesFetcher->getValidRules($product, $context);

        foreach ($rules as $rule) {
            /**
             * @var ActionInterface $action
             */
            foreach ($rule->getActions() as $action) {
                $processor = $this->actionServiceRegistry->get($action->getType());

                if (!$processor instanceof ProductPriceActionProcessorInterface) {
                    continue;
                }

                try {
                    $actionPrice = $processor->getPrice($product, $context, $action->getConfiguration());

                    $price = $actionPrice;
                } catch (NoRetailPriceFoundException) {
                    //Silently ignore the error
                }
            }

            if ($rule->getStopPropagation()) {
                break;
            }
        }

        if (null === $price) {
            throw new NoRetailPriceFoundException(__CLASS__);
        }

        return $price;
    }

    public function getDiscountPrice(ProductInterface $product, array $context): int
    {
        $price = null;

        /**
         * @var PriceRuleInterface[] $rules
         */
        $rules = $this->validRulesFetcher->getValidRules($product, $context);

        foreach ($rules as $rule) {
            /**
             * @var ActionInterface $action
             */
            foreach ($rule->getActions() as $action) {
                $processor = $this->actionServiceRegistry->get($action->getType());

                if (!$processor instanceof ProductDiscountPriceActionProcessorInterface) {
                    continue;
                }

                try {
                    $actionPrice = $processor->getDiscountPrice($product, $context, $action->getConfiguration());
                    $price = $actionPrice;
                } catch (NoDiscountPriceFoundException) {
                    //Silently ignore the error
                }
            }

            if ($rule->getStopPropagation()) {
                break;
            }
        }

        if (null === $price) {
            throw new NoDiscountPriceFoundException(__CLASS__);
        }

        return $price;
    }

    public function getDiscount(ProductInterface $product, array $context, int $price): int
    {
        $discount = 0;

        /**
         * @var PriceRuleInterface[] $rules
         */
        $rules = $this->validRulesFetcher->getValidRules($product, $context);

        if (empty($rules)) {
            return $discount;
        }

        foreach ($rules as $rule) {
            foreach ($rule->getActions() as $action) {
                $processor = $this->actionServiceRegistry->get($action->getType());

                if (!$processor instanceof ProductDiscountActionProcessorInterface) {
                    continue;
                }

                $discount += $processor->getDiscount($product, $price, $context, $action->getConfiguration());
            }

            if ($rule->getStopPropagation()) {
                break;
            }
        }

        return $discount;
    }

    public function getCustomAttributes(ProductInterface $product, array $context): array
    {
        $customAttributes = [];

        /**
         * @var PriceRuleInterface[] $rules
         */
        $rules = $this->validRulesFetcher->getValidRules($product, $context);

        foreach ($rules as $rule) {
            /**
             * @var ActionInterface $action
             */
            foreach ($rule->getActions() as $action) {
                $processor = $this->actionServiceRegistry->get($action->getType());

                if (!$processor instanceof ProductCustomAttributesActionProcessorInterface) {
                    continue;
                }

                $customAttributes += $processor->getCustomAttributes($product, $context, $action->getConfiguration());
            }

            if ($rule->getStopPropagation()) {
                break;
            }
        }

        return $customAttributes;
    }
}
