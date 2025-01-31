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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Behat\Service\SharedStorageInterface;
use CoreShop\Bundle\OrderBundle\DTO\AddToCartInterface;
use CoreShop\Bundle\OrderBundle\Factory\AddToCartFactoryInterface;
use CoreShop\Bundle\OrderBundle\Form\Type\AddToCartType;
use CoreShop\Component\Address\Model\AddressInterface;
use CoreShop\Component\Core\Model\CarrierInterface;
use CoreShop\Component\Core\Model\CustomerInterface;
use CoreShop\Component\Core\Model\OrderInterface;
use CoreShop\Component\Core\Model\OrderItemInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Currency\Model\CurrencyInterface;
use CoreShop\Component\Order\Context\CartContextInterface;
use CoreShop\Component\Order\Factory\OrderItemFactoryInterface;
use CoreShop\Component\Order\Manager\CartManagerInterface;
use CoreShop\Component\StorageList\StorageListItemQuantityModifierInterface;
use CoreShop\Component\StorageList\StorageListModifierInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Webmozart\Assert\Assert;

final class CartContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private CartContextInterface $cartContext,
        private StorageListModifierInterface $cartModifier,
        private StorageListItemQuantityModifierInterface $cartQuantityModifier,
        private CartManagerInterface $cartManager,
        private AddToCartFactoryInterface $addToCartFactory,
        private OrderItemFactoryInterface $factory,
        private FormFactoryInterface $formFactory,
    ) {
    }

    /**
     * @Given /^I add the (product "[^"]+") to my cart$/
     * @Given /^I add the (product "[^"]+") x (\d+) to my cart$/
     * @Given /^I add another (product "[^"]+") to my cart$/
     */
    public function addProductToCart(ProductInterface $product, int $quantity = 1): void
    {
        $cart = $this->cartContext->getCart();

        $cartItem = $this->factory->createWithPurchasable($product);
        $this->cartQuantityModifier->modify($cartItem, $quantity);

        $this->cartModifier->addToList($cart, $cartItem);
        $this->cartManager->persistCart($cart);
    }

    /**
     * @Given /^I change the quantity of (product "[^"]+") to (.*)$/
     */
    public function changeProductQuantityInCart(ProductInterface $product, float $quantity): void
    {
        $cart = $this->cartContext->getCart();
        $foundItem = null;

        foreach ($cart->getItems() as $cartItem) {
            if ($cartItem->getProduct()->getId() === $product->getId()) {
                $foundItem = $cartItem;
            }
        }

        Assert::notNull($foundItem);

        $this->cartQuantityModifier->modify($foundItem, $quantity);
        $this->cartManager->persistCart($cart);
    }

    /**
     * @Given /^I add the (product "[^"]+") to my cart from add-to-cart-form/
     * @Given /^I add another (product "[^"]+") to my cart from add-to-cart-form/
     */
    public function addProductToCartFromAddToCartFormForm(ProductInterface $product): void
    {
        $cart = $this->cartContext->getCart();
        $cartItem = $this->factory->createWithPurchasable($product);
        $addToCart = $this->createAddToCart($cart, $cartItem);
        $form = $this->formFactory->create(AddToCartType::class, $addToCart, ['csrf_protection' => false]);

        $formData = [
            'cartItem' => [
                'quantity' => 1,
            ],
        ];

        $form->submit($formData);

        $this->sharedStorage->set('add_to_cart_form', $form);
        $this->cartManager->persistCart($cart);
    }

    /**
     * @Given /^I add the (product "[^"]+" with unit "[^"]+") to my cart$/
     * @Given /^I add the (product "[^"]+" with unit "[^"]+") in quantity ([^"]+) to my cart$/
     * @Given /^I add another (product "[^"]+" with unit "[^"]+") to my cart$/
     * @Given /^I add another (product "[^"]+" with unit "[^"]+") in quantity ([^"]+) to my cart$/
     */
    public function addProductInUnitToCart(array $productAndUnit, float $quantity = 1.0): void
    {
        $cart = $this->cartContext->getCart();

        /**
         * @var OrderItemInterface $cartItem
         */
        $cartItem = $this->factory->createWithPurchasable($productAndUnit['product']);
        $cartItem->setUnitDefinition($productAndUnit['unit']);

        $this->cartQuantityModifier->modify($cartItem, $quantity);
        $this->cartModifier->addToList($cart, $cartItem);

        $this->cartManager->persistCart($cart);
    }

    /**
     * @Given /^I remove the (product "[^"]+") from my cart$/
     * @Given /^I remove another (product "[^"]+") from my cart$/
     */
    public function removeProductFromCart(ProductInterface $product): void
    {
        $cart = $this->cartContext->getCart();

        foreach ($cart->getItems() as $cartItem) {
            if ($cartItem->getProduct()->getId() === $product->getId()) {
                $this->cartModifier->removeFromList($cart, $cartItem);

                $this->cartManager->persistCart($cart);
            }
        }
    }

    /**
     * @Given /^the cart belongs to (customer "[^"]+")$/
     * @Given /^the cart belongs to (guest "[^"]+")$/
     */
    public function theCartBelongsToCustomer(CustomerInterface $customer): void
    {
        $this->cartContext->getCart()->setCustomer($customer);

        $this->cartManager->persistCart($this->cartContext->getCart());
    }

    /**
     * @Given /^the cart ships to (customer "[^"]+") first address$/
     */
    public function theCartShipsToCustomersFirstAddress(CustomerInterface $customer): void
    {
        Assert::greaterThan(count($customer->getAddresses()), 0);

        $address = $customer->getAddresses();

        $this->cartContext->getCart()->setShippingAddress(reset($address));
        $this->cartManager->persistCart($this->cartContext->getCart());
    }

    /**
     * @Given /^the cart ships to (customer "[^"]+") address with postcode "([^"]+)"$/
     */
    public function theCartShipsToCustomersAddressWithPostcode(CustomerInterface $customer, $postcode): void
    {
        Assert::greaterThan(count($customer->getAddresses()), 0);

        $address = current(array_filter($customer->getAddresses(), function ($address) use ($postcode) {
            return $address->getPostcode() === $postcode;
        }));

        Assert::isInstanceOf($address, AddressInterface::class);

        $this->cartContext->getCart()->setShippingAddress($address);
        $this->cartManager->persistCart($this->cartContext->getCart());
    }

    /**
     * @Given /^the cart invoices to (customer "[^"]+") address with postcode "([^"]+)"$/
     */
    public function theCartInvoicesToCustomersAddressWithPostcode(CustomerInterface $customer, $postcode): void
    {
        Assert::greaterThan(count($customer->getAddresses()), 0);

        $address = current(array_filter($customer->getAddresses(), function ($address) use ($postcode) {
            return $address->getPostcode() === $postcode;
        }));

        Assert::isInstanceOf($address, AddressInterface::class);

        $this->cartContext->getCart()->setInvoiceAddress($address);
        $this->cartManager->persistCart($this->cartContext->getCart());
    }

    /**
     * @Given /^(my cart) uses (currency "[^"]+")$/
     */
    public function myCartIsUsingCurrency(OrderInterface $cart, CurrencyInterface $currency): void
    {
        $cart->setCurrency($currency);

        $this->cartManager->persistCart($cart);
    }

    /**
     * @Given /^(my cart) uses (carrier "[^"]+")$/
     */
    public function myCartIsUsingCarrier(OrderInterface $cart, CarrierInterface $carrier): void
    {
        $cart->setCarrier($carrier);

        $this->cartManager->persistCart($cart);
    }

    /**
     * @Given /^(my cart) uses (store "[^"]+")$/
     */
    public function myCartIsUsingStore(OrderInterface $cart, StoreInterface $store): void
    {
        $cart->setStore($store);

        $this->cartManager->persistCart($cart);
    }

    /**
     * @Given /^I refresh (my cart)$/
     */
    public function iRefreshMyCart(OrderInterface $cart): void
    {
        $this->cartManager->persistCart($cart);
    }

    private function createAddToCart(\CoreShop\Component\Order\Model\OrderInterface $cart, \CoreShop\Component\Order\Model\OrderItemInterface $cartItem): AddToCartInterface
    {
        return $this->addToCartFactory->createWithCartAndCartItem($cart, $cartItem);
    }
}
