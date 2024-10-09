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

namespace CoreShop\Behat\Context\Domain;

use Behat\Behat\Context\Context;
use CoreShop\Component\Core\Model\CarrierInterface;
use CoreShop\Component\Core\Model\OrderInterface;
use CoreShop\Component\Core\Model\OrderItemInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Order\Context\CartContextInterface;
use CoreShop\Component\Order\Model\AdjustmentInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\Taxation\Model\TaxItemInterface;
use Pimcore\Model\DataObject\Fieldcollection;
use Symfony\Component\Form\FormInterface;
use Webmozart\Assert\Assert;

final class CartContext implements Context
{
    public function __construct(
        private CartContextInterface $cartContext,
    ) {
    }

    /**
     * @Then /^there should be one product in my cart$/
     */
    public function thereShouldBeOneProductInTheCart(): void
    {
        Assert::eq(
            count($this->cartContext->getCart()->getItems()),
            1,
            sprintf(
                'There should be only one product in the cart, but found %d',
                count($this->cartContext->getCart()->getItems()),
            ),
        );
    }

    /**
     * @Then /^there should be two products in my cart$/
     */
    public function thereShouldBeTwoProductsInTheCart(): void
    {
        Assert::eq(
            count($this->cartContext->getCart()->getItems()),
            2,
            sprintf(
                'There should be only two products in the cart, but found %d',
                count($this->cartContext->getCart()->getItems()),
            ),
        );
    }

    /**
     * @Then /^the (product "[^"]+") should not be in my cart$/
     */
    public function theProductShouldNotBeInMyCart(ProductInterface $product): void
    {
        $cart = $this->cartContext->getCart();
        $foundItem = null;

        foreach ($cart->getItems() as $cartItem) {
            if ($cartItem->getProduct()->getId() === $product->getId()) {
                $foundItem = $cartItem;

                break;
            }
        }

        Assert::null(
            $foundItem,
            sprintf(
                'Product %s found in cart',
                $product->getName(),
            ),
        );
    }

    /**
     * @Then /^the (product "[^"]+") should be in my cart$/
     */
    public function theProductShouldBeInMyCart(ProductInterface $product): void
    {
        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = null;

        foreach ($this->cartContext->getCart()->getItems() as $item) {
            if ($item->getIsGiftItem()) {
                continue;
            }

            if ($item->getProduct()->getId() === $product->getId()) {
                $cartItem = $item;

                break;
            }
        }

        Assert::notNull(
            $cartItem,
            sprintf(
                'Product %s not found in cart',
                $product->getName(),
            ),
        );
    }

    /**
     * @Then /^the (product "[^"]+") should be in my cart as gift$/
     */
    public function theProductShouldBeInMyCartAsGift(ProductInterface $product): void
    {
        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = null;

        foreach ($this->cartContext->getCart()->getItems() as $item) {
            if (!$item->getIsGiftItem()) {
                continue;
            }

            if ($item->getProduct()->getId() === $product->getId()) {
                $cartItem = $item;

                break;
            }
        }

        Assert::true(
            $cartItem ? $cartItem->getIsGiftItem() : false,
            sprintf(
                'Product %s is not in the Cart or is not a gift',
                $product->getName(),
            ),
        );
    }

    /**
     * @Then /^the cart total should be "([^"]+)" including tax$/
     */
    public function cartTotalShouldBeIncludingTax($total): void
    {
        Assert::eq(
            $total,
            $this->cartContext->getCart()->getTotal(true),
            sprintf(
                'Cart total is expected to be %s, but it is %s',
                $total,
                $this->cartContext->getCart()->getTotal(true),
            ),
        );
    }

    /**
     * @Then /^the cart total should be "([^"]+)" excluding tax$/
     */
    public function cartTotalShouldBeExcludingTax($total): void
    {
        Assert::eq(
            $total,
            $this->cartContext->getCart()->getTotal(false),
            sprintf(
                'Cart total is expected to be %s, but it is %s',
                $total,
                $this->cartContext->getCart()->getTotal(false),
            ),
        );
    }

    /**
     * @Then /^the cart subtotal should be "([^"]+)" including tax$/
     */
    public function cartSubtotalShouldBeIncludingTax($total): void
    {
        Assert::eq(
            $total,
            $this->cartContext->getCart()->getSubtotal(true),
            sprintf(
                'Cart subtotal is expected to be %s, but it is %s',
                $total,
                $this->cartContext->getCart()->getSubtotal(true),
            ),
        );
    }

    /**
     * @Then /^the cart subtotal should be "([^"]+)" excluding tax$/
     */
    public function cartSubtotalShouldBeExcludingTax($total): void
    {
        Assert::eq(
            $total,
            $this->cartContext->getCart()->getSubtotal(false),
            sprintf(
                'Cart subtotal is expected to be %s, but it is %s',
                $total,
                $this->cartContext->getCart()->getSubtotal(false),
            ),
        );
    }

    /**
     * @Then /^the cart total tax should be "([^"]+)"$/
     */
    public function cartTotalTaxShouldBe($totalTax): void
    {
        Assert::eq(
            $totalTax,
            $this->cartContext->getCart()->getTotalTax(),
            sprintf(
                'Cart total is expected to be %s, but it is %s',
                $totalTax,
                $this->cartContext->getCart()->getTotalTax(),
            ),
        );
    }

    /**
     * @Then /^the cart item taxes should be "([^"]+)"$/
     */
    public function cartItemTaxesShouldBe($totalTax): void
    {
        $cart = $this->cartContext->getCart();
        $itemTaxesTotal = 0;

        foreach ($cart->getItems() as $item) {
            $taxesFc = $item->getTaxes();

            if (!$taxesFc instanceof Fieldcollection) {
                continue;
            }
            /**
             * @var TaxItemInterface $tax
             */
            foreach ($taxesFc->getItems() as $tax) {
                $itemTaxesTotal += $tax->getAmount();
            }
        }

        Assert::eq(
            $totalTax,
            $itemTaxesTotal,
            sprintf(
                'Cart item taxes is expected to be %s, but it is %s',
                $totalTax,
                $itemTaxesTotal,
            ),
        );
    }

    /**
     * @Then /^the cart should weigh ([^"]+)kg$/
     */
    public function cartShouldWeigh($kg): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderInterface $cart
         */
        Assert::isInstanceOf($cart, OrderInterface::class);

        Assert::eq(
            $kg,
            $cart->getWeight(),
            sprintf(
                'Cart is expected to weigh %skg, but it weighs %skg',
                $kg,
                $cart->getWeight(),
            ),
        );
    }

    /**
     * @Then /^the cart shipping should be "([^"]+)" excluding tax$/
     */
    public function cartShippingCostShouldBeExcludingTax($shipping): void
    {
        $cart = $this->cartContext->getCart();

        Assert::isInstanceOf($cart, OrderInterface::class);

        Assert::eq(
            $shipping,
            $cart->getShipping(false),
            sprintf(
                'Cart shipping is expected to be %s, but it is %s',
                $shipping,
                $cart->getShipping(false),
            ),
        );
    }

    /**
     * @Then /^the cart shipping should be "([^"]+)" including tax$/
     */
    public function cartShippingCostShouldBeIncludingTax($shipping): void
    {
        $cart = $this->cartContext->getCart();

        Assert::isInstanceOf($cart, OrderInterface::class);

        Assert::eq(
            $shipping,
            $cart->getShipping(true),
            sprintf(
                'Cart shipping is expected to be %s, but it is %s',
                $shipping,
                $cart->getShipping(true),
            ),
        );
    }

    /**
     * @Then /^the (carts) shipping tax rate should be "([^"]+)"$/
     * @Then /^the (loaded carts) shipping tax rate should be "([^"]+)"$/
     */
    public function cartShippingTaxRateShouldBe(OrderInterface $cart, $shippingTaxRate): void
    {
        Assert::eq(
            $shippingTaxRate,
            $cart->getShippingTaxRate(),
            sprintf(
                'Cart shipping is expected to be %s, but it is %s',
                $shippingTaxRate,
                $cart->getShippingTaxRate(),
            ),
        );
    }

    /**
     * @Then /^the cart should use (carrier "[^"]+")$/
     */
    public function cartShouldUseCarrier(CarrierInterface $carrier): void
    {
        $cart = $this->cartContext->getCart();

        Assert::isInstanceOf($cart, OrderInterface::class);
        Assert::isInstanceOf($cart->getCarrier(), CarrierInterface::class);

        Assert::eq(
            $carrier->getId(),
            $cart->getCarrier()->getId(),
            sprintf(
                'Cart is expected to use carrier %s, but found %s',
                $carrier->getTitle('en'),
                $cart->getCarrier()->getTitle('en'),
            ),
        );
    }

    /**
     * @Then /^the cart should not have a carrier$/
     */
    public function cartShouldNotHaveACarrier(): void
    {
        $cart = $this->cartContext->getCart();

        Assert::isInstanceOf($cart, OrderInterface::class);

        Assert::null(
            $cart->getCarrier(),
            'Cart is expected to not have a carrier but found one',
        );
    }

    /**
     * @Then /^the cart discount should be "([^"]+)" including tax$/
     */
    public function cartDiscountShouldBeIncludingTax($total): void
    {
        Assert::eq(
            $total,
            $this->cartContext->getCart()->getDiscount(true),
            sprintf(
                'Cart discount is expected to be %s, but it is %s',
                $total,
                $this->cartContext->getCart()->getDiscount(true),
            ),
        );
    }

    /**
     * @Then /^the cart item discount should be "([^"]+)" including tax$/
     */
    public function cartItemDiscountShouldBeIncludingTax($total): void
    {
        $cartItems = $this->cartContext->getCart()->getItems();
        $discounts = 0;

        foreach ($cartItems as $cartItem) {
            $discounts += $cartItem->getAdjustmentsTotal(AdjustmentInterface::CART_PRICE_RULE, true);
        }

        Assert::eq(
            $total,
            $discounts,
            sprintf(
                'Cart discount is expected to be %s, but it is %s',
                $total,
                $discounts,
            ),
        );
    }

    /**
     * @Then /^the cart discount should be "([^"]+)" excluding tax$/
     */
    public function cartDiscountShouldBeExcludingTax($total): void
    {
        Assert::eq(
            $total,
            $this->cartContext->getCart()->getDiscount(false),
            sprintf(
                'Cart discount is expected to be %s, but it is %s',
                $total,
                $this->cartContext->getCart()->getDiscount(false),
            ),
        );
    }

    /**
     * @Then /^the cart item discount should be "([^"]+)" excluding tax$/
     */
    public function cartItemDiscountShouldBeExcludingTax($total): void
    {
        $cartItems = $this->cartContext->getCart()->getItems();
        $discounts = 0;

        foreach ($cartItems as $cartItem) {
            $discounts += $cartItem->getAdjustmentsTotal(AdjustmentInterface::CART_PRICE_RULE, false);
        }

        Assert::eq(
            $total,
            $discounts,
            sprintf(
                'Cart discount is expected to be %s, but it is %s',
                $total,
                $discounts,
            ),
        );
    }

    /**
     * @Then /^there should be no product in (my cart)$/
     */
    public function thereShouldBeNoProductInMyCart(OrderInterface $cart): void
    {
        Assert::eq(
            count($cart->getItems()),
            0,
            sprintf(
                'There should be no product in the cart, but found %d',
                count($cart->getItems()),
            ),
        );
    }

    /**
     * @Then /^the first item in (my cart) should have (unit "([^"]+)")$/
     */
    public function theFirstItemInMyCartShouldHaveUnit(OrderInterface $cart, ProductUnitInterface $unit): void
    {
        Assert::minCount(
            $cart->getItems(),
            1,
            'Expected to be at least 1 item in the cart, but found none',
        );

        /**
         * @var OrderItemInterface $item
         */
        $item = $cart->getItems()[0];

        Assert::notNull(
            $item->getUnitDefinition(),
            'Expected first cart item to have a unit-definition, but it did not',
        );

        Assert::eq(
            $item->getUnitDefinition()->getUnit(),
            $unit,
            sprintf(
                'Expected cart item to have unit %s, but found %s',
                $item->getUnitDefinition()->getUnitName(),
                $unit->getName(),
            ),
        );
    }

    /**
     * @Then /^the (product "[^"]+") in (my cart) should have (unit "([^"]+)")$/
     */
    public function theProductInMyCartShouldHaveUnit(ProductInterface $product, OrderInterface $cart, ProductUnitInterface $unit): void
    {
        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = null;

        foreach ($cart->getItems() as $item) {
            if (!$item->getIsGiftItem()) {
                continue;
            }

            if ($item->getProduct()->getId() === $product->getId()) {
                $cartItem = $item;

                break;
            }
        }

        Assert::notNull(
            $cartItem,
            sprintf(
                'Product %s is not in the Cart or is not a gift',
                $product->getName(),
            ),
        );

        Assert::notNull(
            $cartItem->getUnitDefinition(),
            'Expected cart item to have a unit-definition, but it did not',
        );

        Assert::eq(
            $cartItem->getUnitDefinition()?->getUnit(),
            $unit,
            sprintf(
                'Expected cart item to have unit %s, but found %s',
                $cartItem->getUnitDefinition()?->getUnitName(),
                $unit->getName(),
            ),
        );
    }

    /**
     * @Then /^the (product "[^"]+") in (my cart) should have no unit$/
     */
    public function theProductInMyCartShouldHaveNoUnit(ProductInterface $product, OrderInterface $cart): void
    {
        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = null;

        foreach ($cart->getItems() as $item) {
            if (!$item->getIsGiftItem()) {
                continue;
            }

            if ($item->getProduct()->getId() === $product->getId()) {
                $cartItem = $item;

                break;
            }
        }

        Assert::notNull(
            $cartItem,
            sprintf(
                'Product %s is not in the Cart or is not a gift',
                $product->getName(),
            ),
        );

        Assert::null(
            $cartItem->getUnitDefinition(),
            'Expected cart item to have not a unit-definition, but it had one',
        );
    }

    /**
     * @Then /^the second item in (my cart) should have (unit "([^"]+)")$/
     */
    public function theSecondItemInMyCartShouldHaveUnit(OrderInterface $cart, ProductUnitInterface $unit): void
    {
        Assert::minCount(
            $cart->getItems(),
            2,
            sprintf('Expected to be at least 2 items in the cart, but found %s', count($cart->getItems())),
        );

        /**
         * @var OrderItemInterface $item
         */
        $item = $cart->getItems()[1];

        Assert::notNull(
            $item->getUnitDefinition(),
            'Expected first cart item to have a unit-definition, but it did not',
        );

        Assert::eq(
            $item->getUnitDefinition()->getUnit(),
            $unit,
            sprintf(
                'Expected cart item to have unit %s, but found %s',
                $item->getUnitDefinition()->getUnitName(),
                $unit->getName(),
            ),
        );
    }

    /**
     * @Then /^there should be a violation message in my (add-to-cart-form) with message "([^"]+)"$/
     */
    public function thereShouldBeCartFormViolation(FormInterface $addToCartForm, $message): void
    {
        Assert::greaterThan($addToCartForm->getErrors()->count(), 0);

        foreach ($addToCartForm->getErrors(true, true) as $error) {
            Assert::eq(
                $error->getMessage(),
                $message,
            );
        }
    }

    /**
     * @Then /^the cart item with (product) should have discount-price with "(\d+)" including tax$/
     * @Then /^the cart item with (product "[^"]+") should have discount-price with "(\d+)" including tax$/
     */
    public function theCartItemWithProductShouldHaveADiscountPriceWithTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getItemDiscountPrice(true),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have discount-price with "(\d+)" excluding tax$/
     * @Then /^the cart item with (product "[^"]+") should have discount-price with "(\d+)" excluding tax$/
     */
    public function theCartItemWithProductShouldHaveADiscountPriceWithoutTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getItemDiscountPrice(false),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have discount with "(\d+)" including tax$/
     * @Then /^the cart item with (product "[^"]+") should have discount with "(\d+)" including tax$/
     */
    public function theCartItemWithProductShouldHaveADiscountWithTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getItemDiscount(true),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have discount with "(\d+)" excluding tax$/
     * @Then /^the cart item with (product "[^"]+") should have discount with "(\d+)" excluding tax$/
     */
    public function theCartItemWithProductShouldHaveADiscountWithoutTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getItemDiscount(false),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have total with "(\d+)" including tax$/
     * @Then /^the cart item with (product "[^"]+") should have total with "(\d+)" including tax$/
     */
    public function theCartItemWithProductShouldHaveATotalWithTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getTotal(true),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have total with "(\d+)" excluding tax$/
     * @Then /^the cart item with (product "[^"]+") should have total with "(\d+)" excluding tax$/
     */
    public function theCartItemWithProductShouldHaveATotalWithoutTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getTotal(false),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have retail-price with "(\d+)" including tax$/
     * @Then /^the cart item with (product "[^"]+") should have retail-price with "(\d+)" including tax$/
     */
    public function theCartItemWithProductShouldHaveARetailWithTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getItemRetailPrice(true),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have retail-price with "(\d+)" excluding tax$/
     * @Then /^the cart item with (product "[^"]+") should have retail-price with "(\d+)" excluding tax$/
     */
    public function theCartItemWithProductShouldHaveARetalWithoutTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getItemRetailPrice(false),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have converted discount-price with "(\d+)" including tax$/
     * @Then /^the cart item with (product "[^"]+") should have converted discount-price with "(\d+)" including tax$/
     */
    public function theCartItemWithProductShouldHaveAConvertedDiscountPriceWithTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getConvertedItemDiscountPrice(true),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have converted discount-price with "(\d+)" excluding tax$/
     * @Then /^the cart item with (product "[^"]+") should have converted discount-price with "(\d+)" excluding tax$/
     */
    public function theCartItemWithProductShouldHaveAConvertedDiscountPriceWithoutTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getConvertedItemDiscountPrice(false),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have converted discount with "(\d+)" including tax$/
     * @Then /^the cart item with (product "[^"]+") should have converted discount with "(\d+)" including tax$/
     */
    public function theCartItemWithProductShouldHaveAConvertedDiscountWithTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getConvertedItemDiscount(true),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have converted discount with "(\d+)" excluding tax$/
     * @Then /^the cart item with (product "[^"]+") should have converted discount with "(\d+)" excluding tax$/
     */
    public function theCartItemWithProductShouldHaveAConvertedDiscountWithoutTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getConvertedItemDiscount(false),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have converted total with "(\d+)" including tax$/
     * @Then /^the cart item with (product "[^"]+") should have converted total with "(\d+)" including tax$/
     */
    public function theCartItemWithProductShouldHaveConvertedATotalWithTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getConvertedTotal(true),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have converted total with "(\d+)" excluding tax$/
     * @Then /^the cart item with (product "[^"]+") should have converted total with "(\d+)" excluding tax$/
     */
    public function theCartItemWithProductShouldHaveAConvertedTotalWithoutTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getConvertedTotal(false),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have converted retail-price with "(\d+)" including tax$/
     * @Then /^the cart item with (product "[^"]+") should have converted retail-price with "(\d+)" including tax$/
     */
    public function theCartItemWithProductShouldHaveAConvertedRetailWithTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getConvertedItemRetailPrice(true),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have converted retail-price with "(\d+)" excluding tax$/
     * @Then /^the cart item with (product "[^"]+") should have converted retail-price with "(\d+)" excluding tax$/
     */
    public function theCartItemWithProductShouldHaveAConvertedRetalWithoutTax(ProductInterface $product, int $price): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::eq(
            $cartItem->getConvertedItemRetailPrice(false),
            $price,
        );
    }

    /**
     * @Then /^the cart item with (product) should have a custom attribute named "([^"]+)"$/
     * @Then /^the cart item with (product "[^"]+") should have a custom attribute named "([^"]+)"$/
     */
    public function theCartItemWithProductShouldHaveACustomAttributeNamed(ProductInterface $product, string $attributeName): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::notNull(
            $cartItem->findAttribute($attributeName),
        );
    }

    /**
     * @Then /^the cart item with (product) should not have a custom attribute named "([^"]+)"$/
     * @Then /^the cart item with (product "[^"]+") should not have a custom attribute named "([^"]+)"$/
     */
    public function theCartItemWithProductShouldNotHaveACustomAttributeNamed(ProductInterface $product, string $attributeName): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->findCartItemByProduct($cart, $product);

        Assert::null(
            $cartItem->findAttribute($attributeName),
        );
    }

    /**
     * @Then /^the cart converted shipping should be "([^"]+)" excluding tax$/
     */
    public function cartConvertedShippingCostShouldBeExcludingTax($shipping): void
    {
        $cart = $this->cartContext->getCart();

        Assert::isInstanceOf($cart, OrderInterface::class);

        Assert::eq(
            $shipping,
            $cart->getConvertedShipping(false),
            sprintf(
                'Cart shipping is expected to be %s, but it is %s',
                $shipping,
                $cart->getConvertedShipping(false),
            ),
        );
    }

    /**
     * @Then /^the cart converted shipping should be "([^"]+)" including tax$/
     */
    public function cartConvertedShippingCostShouldBeIncludingTax($shipping): void
    {
        $cart = $this->cartContext->getCart();

        Assert::isInstanceOf($cart, OrderInterface::class);

        Assert::eq(
            $shipping,
            $cart->getConvertedShipping(true),
            sprintf(
                'Cart shipping is expected to be %s, but it is %s',
                $shipping,
                $cart->getConvertedShipping(true),
            ),
        );
    }

    private function findCartItemByProduct(OrderInterface $cart, ProductInterface $product)
    {
        foreach ($cart->getItems() as $cartItem) {
            if ($cartItem->getProduct()->getId() === $product->getId()) {
                return $cartItem;
            }
        }

        throw new \Exception('Cart Item not found');
    }
}
