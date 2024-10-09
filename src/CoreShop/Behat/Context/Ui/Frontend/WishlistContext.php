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
use CoreShop\Behat\Page\Frontend\ProductPageInterface;
use CoreShop\Behat\Page\Frontend\WishlistPageInterface;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use Pimcore\Model\DataObject\Concrete;
use Webmozart\Assert\Assert;

final class WishlistContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private WishlistPageInterface $wishlistPage,
        private ProductPageInterface $productPage,
    ) {
    }

    /**
     * @When I see the summary of my wishlist
     */
    public function iOpenWishlistSummaryPage(): void
    {
        $this->wishlistPage->open();
    }

    /**
     * @Then my wishlist should be empty
     * @Then wishlist should be empty with no value
     */
    public function iShouldBeNotifiedThatMyWishlistIsEmpty(): void
    {
        $this->wishlistPage->open();

        Assert::true($this->wishlistPage->isEmpty());
    }

    /**
     * @Given /^I add this (product) to the wishlist$/
     * @Given /^I add (product "[^"]+") to the wishlist$/
     */
    public function iAddProductToTheWishlist(ProductInterface $product): void
    {
        $path = null;

        if ($product instanceof Concrete) {
            $path = $product->getClass()->getLinkGenerator()->generate($product, ['_locale' => 'en']);
        }

        $this->productPage->tryToOpenWithUri($path);
        $this->productPage->addToWishlist();

        $this->sharedStorage->set('product', $product);
    }

    /**
     * @Given I removed product :productName from the wishlist
     *
     * @When I remove product :productName from the wishlist
     */
    public function iRemoveProductFromTheWishlist(string $productName): void
    {
        $this->wishlistPage->open();
        $this->wishlistPage->removeProduct($productName);
    }

    /**
     * @Then /^I should be(?: on| redirected to) the wishlist summary page$/
     */
    public function shouldBeOnMyCartSummaryPage(): void
    {
        $this->wishlistPage->verify();
    }

    /**
     * @Then this wishlist item should have name :itemName
     */
    public function thisProductShouldHaveName($itemName): void
    {
        Assert::true($this->wishlistPage->hasItemNamed($itemName));
    }

    /**
     * @Then I can see the share wishlist link
     */
    public function iCanSeeTheShareWishlistLink(): void
    {
        Assert::true($this->wishlistPage->hasShareWishlistLink());
    }

    /**
     * @Given I visit the share wishlist link
     */
    public function iVisitTheShareWishlistLink(): void
    {
        $this->wishlistPage->open();
        $this->wishlistPage->tryToOpenWithUri($this->wishlistPage->getShareWishlistLink());
    }
}
