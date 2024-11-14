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

namespace CoreShop\Behat\Context\Ui\Frontend;

use Behat\Behat\Context\Context;
use CoreShop\Behat\Page\Frontend\CartCreatePageInterface;
use CoreShop\Behat\Page\Frontend\CartPageInterface;
use CoreShop\Behat\Page\Frontend\CartsListPageInterface;
use CoreShop\Behat\Page\Frontend\ProductPageInterface;
use CoreShop\Bundle\TestBundle\Service\NotificationCheckerInterface;
use CoreShop\Bundle\TestBundle\Service\NotificationType;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use Pimcore\Model\DataObject\Concrete;
use Webmozart\Assert\Assert;

final class CartContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private NotificationCheckerInterface $notificationChecker,
        private CartPageInterface $cartPage,
        private CartCreatePageInterface $cartCreatePage,
        private CartsListPageInterface $cartsListPage,
        private ProductPageInterface $productPage,
    ) {
    }

    /**
     * @When I see the summary of my cart
     */
    public function iOpenCartSummaryPage(): void
    {
        $this->cartPage->open();
    }

    /**
     * @Then my cart should be empty
     * @Then cart should be empty with no value
     */
    public function iShouldBeNotifiedThatMyCartIsEmpty(): void
    {
        $this->cartPage->open();

        Assert::true($this->cartPage->isEmpty());
    }

    /**
     * @Given /^I add this (product) to the cart$/
     * @Given /^I add (product "[^"]+") to the cart$/
     */
    public function iAddProductToTheCart(ProductInterface $product): void
    {
        $path = null;

        if ($product instanceof Concrete) {
            $path = $product->getClass()->getLinkGenerator()->generate($product, ['_locale' => 'en']);
        }

        $this->productPage->tryToOpenWithUri($path);
        $this->productPage->addToCart();

        $this->sharedStorage->set('product', $product);
    }

    /**
     * @Given /^I add (\d+) of this (product) to the cart$/
     */
    public function iAddQuantityProductToTheCart($quantity, ProductInterface $product): void
    {
        $path = null;

        if ($product instanceof Concrete) {
            $path = $product->getClass()->getLinkGenerator()->generate($product, ['_locale' => 'en']);
        }

        $this->productPage->tryToOpenWithUri($path);
        $this->productPage->addToCartWithQuantity($quantity);
    }

    /**
     * @Given /^I add this (product) in (unit "[^"]+") to the cart$/
     * @Given /^I add (product "[^"]+") in (unit "[^"]+") to the cart$/
     */
    public function iAddProductInUnitToTheCart(ProductInterface $product, ProductUnitInterface $unit): void
    {
        $unitDefinition = $this->findUnitDefinition($product, $unit);

        $path = null;

        if ($product instanceof Concrete) {
            $path = $product->getClass()->getLinkGenerator()->generate($product, ['_locale' => 'en']);
        }

        $this->productPage->tryToOpenWithUri($path);
        $this->productPage->addToCartInUnit($unitDefinition);

        $this->sharedStorage->set('product', $product);
    }

    /**
     * @Given /^I add (\d+) of this (product) in (unit "[^"]+") to the cart$/
     * @Given /^I add (\d+) of (product "[^"]+") in (unit "[^"]+") to the cart$/
     */
    public function iAddQuantityProductInUnitToTheCart($quantity, ProductInterface $product, ProductUnitInterface $unit): void
    {
        $unitDefinition = $this->findUnitDefinition($product, $unit);

        $path = null;

        if ($product instanceof Concrete) {
            $path = $product->getClass()->getLinkGenerator()->generate($product, ['_locale' => 'en']);
        }

        $this->productPage->tryToOpenWithUri($path);
        $this->productPage->addToCartInUnitWithQuantity($unitDefinition, $quantity);

        $this->sharedStorage->set('product', $product);
    }

    /**
     * @Given I removed product :productName from the cart
     *
     * @When I remove product :productName from the cart
     */
    public function iRemoveProductFromTheCart(string $productName): void
    {
        $this->cartPage->open();
        $this->cartPage->removeProduct($productName);
    }

    /**
     * @Then /^I should be(?: on| redirected to) the cart summary page$/
     */
    public function shouldBeOnMyCartSummaryPage(): void
    {
        $this->cartPage->verify();
    }

    /**
     * @Then I should be notified that the product has been successfully added
     */
    public function iShouldBeNotifiedThatItHasBeenSuccessfullyAdded(): void
    {
        $this->notificationChecker->checkNotification('Item added', NotificationType::success());
    }

    /**
     * @Then I should be notified that the voucher has been applied
     */
    public function iShouldBeNotifiedThatTheVoucherHasBeenApplied(): void
    {
        $this->notificationChecker->checkNotification('Voucher has been successfully applied', NotificationType::success());
    }

    /**
     * @Then I should be notified that the voucher is invalid
     */
    public function iShouldBeNotifiedThatTheVoucherIsInvalid(): void
    {
        $this->notificationChecker->checkNotification('This voucher is invalid', NotificationType::error());
    }

    /**
     * @Then I should be notified that I need to order at least :quantity of :productName
     */
    public function iShouldBeNotifiedThatItNeedToOrderAtLeastOf(string $quantity, string $productName): void
    {
        $this->notificationChecker->checkNotification(
            sprintf('You need to order at least %s units of %s.', $quantity, $productName),
            NotificationType::error(),
        );
    }

    /**
     * @Then I should be notified that I can only order a maximum of :quantity of :productName
     */
    public function iShouldBeNotifiedThatICanOnlyOrderAMaximumQuantityOf(string $quantity, string $productName): void
    {
        $this->notificationChecker->checkNotification(
            sprintf('You can order a maximum of %s units of %s.', $quantity, $productName),
            NotificationType::error(),
        );
    }

    /**
     * @Then I should be notified that :productName does not have sufficient stock
     */
    public function iShouldBeNotifiedThatDoesNotHaveSufficientStock(string $productName): void
    {
        $this->notificationChecker->checkNotification(
            sprintf('%s does not have sufficient stock.', $productName),
            NotificationType::error(),
        );
    }

    /**
     * @Then there should be one item in my cart
     */
    public function thereShouldBeOneItemInMyCart(): void
    {
        Assert::true($this->cartPage->isSingleItemOnPage());
    }

    /**
     * @Then this item should have name :itemName
     */
    public function thisProductShouldHaveName($itemName): void
    {
        Assert::true($this->cartPage->hasItemNamed($itemName));
    }

    /**
     * @Given /^I apply the voucher code "([^"]+)"$/
     */
    public function iApplyTheCartRuleToMyCart($voucherCode): void
    {
        $this->cartPage->applyVoucherCode($voucherCode);
    }

    /**
     * @Then /^I should see "([^"]+)" with unit price "([^"]+)" in my cart$/
     */
    public function iShouldSeeProductWithUnitPriceInMyCart($productName, $unitPrice): void
    {
        Assert::same($this->cartPage->getItemUnitPrice($productName), $unitPrice);
    }

    /**
     * @Then /^I should see "([^"]+)" with total price "([^"]+)" in my cart$/
     */
    public function iShouldSeeProductWithTotalPriceInMyCart($productName, $totalPrice): void
    {
        Assert::same($this->cartPage->getItemTotalPrice($productName), $totalPrice);
    }

    /**
     * @Then /^I should see (product "[^"]+") in (unit "[^"]+") with unit price "([^"]+)" in my cart$/
     */
    public function iShouldSeeProductInUnitWithUnitPriceInMyCart(ProductInterface $product, ProductUnitInterface $unit, $unitPrice): void
    {
        $unitDefinition = $this->findUnitDefinition($product, $unit);

        Assert::same($this->cartPage->getItemUnitPriceWithUnit($product->getName(), $unitDefinition), $unitPrice);
    }

    /**
     * @Then /^I should see (product "[^"]+") in (unit "[^"]+") with total price "([^"]+)" in my cart$/
     */
    public function iShouldSeeProductInUnitWithTotalPriceInMyCart(ProductInterface $product, ProductUnitInterface $unit, $totalPrice): void
    {
        $unitDefinition = $this->findUnitDefinition($product, $unit);

        Assert::same($this->cartPage->getItemTotalPriceWithUnit($product->getName(), $unitDefinition), $totalPrice);
    }

    /**
     * @Then /^I should see this (product) with (unit "[^"]+") in my cart$/
     * @Then /^I should see (product "[^"]+") with (unit "[^"]+") in my cart$/
     */
    public function iShouldSeeProductWithUnitInMyCart(ProductInterface $product, ProductUnitInterface $unit): void
    {
        $unitDefinition = $this->findUnitDefinition($product, $unit);

        Assert::true($this->cartPage->hasProductInUnit($product->getName(), $unitDefinition));
    }

    /**
     * @Then /^I should see "([^"]+)" with quantity (\d+) in my cart$/
     */
    public function iShouldSeeWithQuantityInMyCart($productName, $quantity): void
    {
        Assert::same($this->cartPage->getQuantity($productName), (int) $quantity);
    }

    /**
     * @Given I change :productName quantity to :quantity
     */
    public function iChangeQuantityTo($productName, $quantity): void
    {
        $this->cartPage->open();
        $this->cartPage->changeQuantity($productName, $quantity);
    }

    /**
     * @Given /^I create a new named cart "([^"]+)"$/
     */
    public function iCreatedANewNamedCart(string $cartName): void
    {
        $this->cartCreatePage->open();
        $this->cartCreatePage->createNamedCart($cartName);
    }

    /**
     * @Then /^I should be notified that the cart was created$/
     */
    public function iShouldBeNotifiedThatTheCartWasCreated(): void
    {
        Assert::true($this->cartCreatePage->checkValidationMessageFor(
            'Cart was created',
        ));
    }

    /**
     * @Given /^I open the cart list page$/
     */
    public function iOpenTheCartListPage(): void
    {
        $this->cartsListPage->open();
    }

    /**
     * @Given /^The cart named "([^"]+)" should be selected$/
     */
    public function theCartNamedShouldBeSelected(string $name): void
    {
        $this->cartsListPage->open();
        Assert::true($this->cartsListPage->namedCartIsSelected($name));
    }

    /**
     * @Given /^Cart with name "([^"]+)" should have total of "([^"]+)"$/
     */
    public function cartWithNameShouldHaveTotal(string $name, string $total): void
    {
        $this->cartsListPage->open();
        Assert::same($this->cartsListPage->getNamedCartTotal($name), $total);
    }

    /**
     * @Given /^I select named cart "([^"]+)"$/
     */
    public function iSelectTheNamedCart(string $name): void
    {
        $this->cartsListPage->open();
        $this->cartsListPage->selectNamedCart($name);
    }

    /**
     * @Then my cart's total should be :total
     */
    public function myCartsTotalShouldBe($total): void
    {
        $this->cartPage->open();

        Assert::same($this->cartPage->getTotal(), $total);
    }

    private function findUnitDefinition(ProductInterface $product, ProductUnitInterface $unit)
    {
        $unitDefinition = null;

        Assert::notNull($product->getUnitDefinitions());

        foreach ($product->getUnitDefinitions()->getUnitDefinitions() as $definition) {
            if ($definition->getUnit()->getId() === $unit->getId()) {
                $unitDefinition = $definition;

                break;
            }
        }

        Assert::notNull($unitDefinition);

        return $unitDefinition;
    }
}
