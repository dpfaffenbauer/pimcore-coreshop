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

namespace CoreShop\Component\Core\Order\Processor;

use CoreShop\Component\Core\Model\OrderItemInterface;
use CoreShop\Component\Order\Calculator\PurchasableCalculatorInterface;
use CoreShop\Component\Order\Cart\CartContextResolverInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Model\OrderItemAttributeInterface;
use CoreShop\Component\Order\Processor\CartItemProcessorInterface;
use CoreShop\Component\Order\Processor\CartProcessorInterface;
use CoreShop\Component\Product\Model\ProductInterface;
use CoreShop\Component\ProductQuantityPriceRules\Detector\QuantityReferenceDetectorInterface;
use CoreShop\Component\ProductQuantityPriceRules\Exception\NoPriceFoundException;
use CoreShop\Component\ProductQuantityPriceRules\Exception\NoRuleFoundException;
use CoreShop\Component\ProductQuantityPriceRules\Model\QuantityRangePriceAwareInterface;
use Pimcore\Model\DataObject\Fieldcollection;

final class CartItemsProcessor implements CartProcessorInterface
{
    public function __construct(
        private PurchasableCalculatorInterface $productPriceCalculator,
        private QuantityReferenceDetectorInterface $quantityReferenceDetector,
        private CartItemProcessorInterface $cartItemProcessor,
        private CartContextResolverInterface $cartContextResolver,
    ) {
    }

    public function process(OrderInterface $cart): void
    {
        $context = $this->cartContextResolver->resolveCartContext($cart);

        /**
         * @var OrderItemInterface $item
         */
        foreach ($cart->getItems() as $item) {
            if ($item->isImmutable()) {
                continue;
            }

            if ($item->getIsGiftItem()) {
                $this->cartItemProcessor->processCartItem(
                    $item,
                    0,
                    0,
                    0,
                    0,
                    $context,
                );

                continue;
            }

            $product = $item->getProduct();

            if ($item->hasUnitDefinition()) {
                $context['unitDefinition'] = $item->getUnitDefinition();
            } else {
                unset($context['unitDefinition']);
            }

            $context['cartItem'] = $item;

            $itemPrice = $this->productPriceCalculator->getPrice($product, $context, true);

            // respect item quantity factor
            if ($product instanceof ProductInterface && is_numeric($product->getItemQuantityFactor()) && $product->getItemQuantityFactor() > 1) {
                $itemPrice = (int) round($itemPrice / $product->getItemQuantityFactor());
            }

            if ($product instanceof QuantityRangePriceAwareInterface) {
                try {
                    $itemPrice = $this->quantityReferenceDetector->detectQuantityPrice(
                        $product,
                        $item->getQuantity(),
                        $itemPrice,
                        $context,
                    );
                } catch (NoRuleFoundException|NoPriceFoundException) {
                }
            }

            $itemPriceWithoutDiscount = $this->productPriceCalculator->getPrice($product, $context);
            $itemRetailPrice = $this->productPriceCalculator->getRetailPrice($product, $context);
            $itemDiscountPrice = $this->productPriceCalculator->getDiscountPrice($product, $context);
            $itemDiscount = $this->productPriceCalculator->getDiscount($product, $context, $itemPriceWithoutDiscount);
            $customAttributes = $this->productPriceCalculator->getCustomAttributes($product, $context);

            $this->processCustomAttributes($item, $customAttributes);

            if (null === $item->getCustomItemDiscount()) {
                $item->setCustomItemDiscount(0);
            }

            if ($item->getCustomItemPrice()) {
                $itemPrice = $item->getCustomItemPrice();
            } else {
                $item->setCustomItemPrice(0);
            }

            if ($item->getCustomItemDiscount() > 0) {
                $itemPrice = (int) round((100 - $item->getCustomItemDiscount()) / 100 * $itemPrice);
            }

            $this->cartItemProcessor->processCartItem(
                $item,
                $itemPrice,
                $itemRetailPrice,
                $itemDiscountPrice,
                $itemDiscount,
                $context,
            );
        }
    }

    protected function processCustomAttributes(OrderItemInterface $item, array $customAttributes): void
    {
        // Update Order Item Attributes
        $orderItemAttributes = $item->getAttributes();

        foreach ($customAttributes as $customAttribute) {
            $item->addAttribute($customAttribute);
        }

        $removedAttributes = [];

        if ($orderItemAttributes instanceof Fieldcollection) {
            foreach ($orderItemAttributes as $existingAttribute) {
                if (!$existingAttribute instanceof OrderItemAttributeInterface) {
                    continue;
                }

                foreach ($customAttributes as $newAttribute) {
                    if ($existingAttribute->getAttributeKey() === $newAttribute->getAttributeKey()) {
                        continue 2;
                    }
                }

                $removedAttributes[] = $existingAttribute;
            }

            foreach ($removedAttributes as $attribute) {
                $item->removeAttribute($attribute);
            }
        }
    }
}
