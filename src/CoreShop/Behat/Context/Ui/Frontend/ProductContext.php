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
use Behat\Mink\Session;
use CoreShop\Behat\Page\Frontend\ProductPageInterface;
use CoreShop\Bundle\TestBundle\Service\JavascriptHelper;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\Variant\Model\AttributeInterface;
use Pimcore\Model\DataObject\Concrete;
use Webmozart\Assert\Assert;

final class ProductContext implements Context
{
    public function __construct(
        private Session $session,
        private ProductPageInterface $productPage,
    ) {
    }

    /**
     * @When /^I open the page "([^"]+)" for this (product)$/
     */
    public function iOpenPage($url, ProductInterface $product): void
    {
        $this->productPage->tryToOpenWithUri($url);
    }

    /**
     * @Then /^I should be on the (product's) detail page$/
     * @Then /^I should be on the (variant's) detail page$/
     * @Then /^I should be on the detail page for (product with key "([^"]+)")$/
     * @Then /^I should be on the detail page for (variant with key "([^"]+)")$/
     */
    public function iShouldBeOnProductDetailedPage(ProductInterface $product): void
    {
        $path = null;

        if ($product instanceof Concrete) {
            $path = $product->getClass()->getLinkGenerator()->generate($product, ['_locale' => 'en']);
        }

        Assert::true($this->productPage->isOpenWithUri($path));
    }

    /**
     * @When /^I open the (product's) detail page$/
     * @When /^I open the (variant's) detail page$/
     */
    public function iCheckLatestProducts(ProductInterface $product): void
    {
        $path = null;

        if ($product instanceof Concrete) {
            $path = $product->getClass()->getLinkGenerator()->generate($product, ['_locale' => 'en']);
        }

        $this->productPage->tryToOpenWithUri($path);
        JavascriptHelper::waitForVariantsToBeReady($this->session);
    }

    /**
     * @Then I should see the product name :name
     */
    public function iShouldSeeProductName($name): void
    {
        Assert::same($this->productPage->getName(), $name);
    }

    /**
     * @Then I should see the price :price
     */
    public function iShouldSeeThePrice($price): void
    {
        Assert::same($this->productPage->getPrice(), $price);
    }

    /**
     * @Then I should see the original price :price
     */
    public function iShouldSeeTheOriginalPrice($price): void
    {
        Assert::same($this->productPage->getOriginalPrice(), $price);
    }

    /**
     * @Then I should see the discount of :price
     */
    public function iShouldSeeTheDiscountOf($discount): void
    {
        Assert::same($this->productPage->getDiscount(), $discount);
    }

    /**
     * @Then I should see :taxRate tax-rate
     */
    public function iShouldSeeTheTaxRate($taxRate): void
    {
        Assert::same($this->productPage->getTaxRate(), $taxRate);
    }

    /**
     * @Then I should see :tax tax
     */
    public function iShouldSeeTheTax($tax): void
    {
        Assert::same($this->productPage->getTax(), $tax);
    }

    /**
     * @Then I should see the price :price for unit :unit
     */
    public function iShouldSeeThePriceForUnit($price, $unit): void
    {
        Assert::same($this->productPage->getPriceForUnit($unit), $price);
    }

    /**
     * @Then I should see one quantity price rule with price :price
     */
    public function iShouldSeeOneQuantityPiceRuleWithPrice($price): void
    {
        $priceRules = $this->productPage->getQuantityPriceRules();

        Assert::count($priceRules, 1);
        Assert::contains($priceRules[0]['price'], $price);
    }

    /**
     * @Then I should see the quantity price rule :number with price :price
     */
    public function iShouldSeeTheQuantityPriceRuleWithPrice(int $number, $price): void
    {
        --$number;
        $priceRules = $this->productPage->getQuantityPriceRules();

        Assert::greaterThan($priceRules, $number + 1);
        Assert::contains($priceRules[$number]['price'], $price);
    }

    /**
     * @Then I should see the quantity price rule :number with excl price :price
     */
    public function iShouldSeeTheQuantityPriceRuleWithInclPrice(int $number, $price): void
    {
        --$number;
        $priceRules = $this->productPage->getQuantityPriceRules();

        Assert::greaterThan($priceRules, $number + 1);
        Assert::contains($priceRules[$number]['priceExcl'], $price);
    }

    /**
     * @Then I should see the quantity price rule :number starting from :startingFrom
     */
    public function iShouldSeeTheQuantityPriceRuleStartingFrom(int $number, $startingFrom): void
    {
        --$number;
        $priceRules = $this->productPage->getQuantityPriceRules();

        Assert::greaterThan($priceRules, $number + 1);
        Assert::contains($priceRules[$number]['startingFrom'], $startingFrom);
    }

    /**
     * @Then /^I should see one quantity price rule with price "([^"]+)" for (unit "[^"]+")$/
     */
    public function iShouldSeeOneQuantityPiceRuleForUnitWithPrice($price, ProductUnitInterface $unit): void
    {
        $priceRules = $this->productPage->getQuantityPriceRulesForUnit($unit);

        Assert::count($priceRules, 1);
        Assert::contains($priceRules[0]['price'], $price);
    }

    /**
     * @Then /^I should see the quantity price rule (\d+) with price "([^"]+)" for (unit "[^"]+")$/
     */
    public function iShouldSeeTheQuantityPriceRuleForUnitWithPrice(int $number, $price, ProductUnitInterface $unit): void
    {
        --$number;
        $priceRules = $this->productPage->getQuantityPriceRulesForUnit($unit);

        Assert::greaterThan($priceRules, $number + 1);
        Assert::contains($priceRules[$number]['price'], $price);
    }

    /**
     * @Then /^I should see the quantity price rule (\d+) with excl price "([^"]+)" for (unit "[^"]+")$/
     */
    public function iShouldSeeTheQuantityPriceRuleForUnitWithInclPrice(int $number, $price, ProductUnitInterface $unit): void
    {
        --$number;
        $priceRules = $this->productPage->getQuantityPriceRulesForUnit($unit);

        Assert::greaterThan($priceRules, $number + 1);
        Assert::contains($priceRules[$number]['priceExcl'], $price);
    }

    /**
     * @Then /^I should see the quantity price rule (\d+) starting from "(\d+)" for (unit "[^"]+")$/
     */
    public function iShouldSeeTheQuantityPriceRuleForUnitStartingFrom(int $number, $startingFrom, ProductUnitInterface $unit): void
    {
        --$number;
        $priceRules = $this->productPage->getQuantityPriceRulesForUnit($unit);

        Assert::greaterThan($priceRules, $number + 1);
        Assert::contains($priceRules[$number]['startingFrom'], $startingFrom);
    }

    /**
     * @Then /^I should see that this (product) is out of stock$/
     */
    public function iShouldSeeThatThisProductIsOutOfStock(ProductInterface $product): void
    {
        $path = null;

        if ($product instanceof Concrete) {
            $path = $product->getClass()->getLinkGenerator()->generate($product, ['_locale' => 'en']);
        }

        $this->productPage->tryToOpenWithUri($path);

        Assert::true($this->productPage->getIsOutOfStock());
    }

    /**
     * @Then /^I click on (attribute value "[^"]+")$/
     * @Then /^I click on (attribute color "[^"]+")$/
     */
    public function iClickOnAttribute(AttributeInterface $attribute): void
    {
        $this->productPage->clickAttribute($attribute);
        JavascriptHelper::waitForVariantsToBeReady($this->session);
    }

    /**
     * @Then /^(attribute value "[^"]+") is selected$/
     * @Then /^(attribute color "[^"]+") is selected$/
     */
    public function attributeIsSelected(AttributeInterface $attribute): void
    {
        Assert::true($this->productPage->isAttributeSelected($attribute));
    }

    /**
     * @Then /^(attribute value "[^"]+") is not selected$/
     * @Then /^(attribute color "[^"]+") is not selected$/
     */
    public function attributeIsNotSelected(AttributeInterface $attribute): void
    {
        Assert::false($this->productPage->isAttributeSelected($attribute));
    }

    /**
     * @Then /^(attribute value "[^"]+") is disabled/
     * @Then /^(attribute color "[^"]+") is disabled$/
     */
    public function attributeIsDisabled(AttributeInterface $attribute): void
    {
        Assert::true($this->productPage->isAttributeDisabled($attribute));
    }

    /**
     * @Then /^(attribute value "[^"]+") is enabled$/
     * @Then /^(attribute color "[^"]+") is enabled$/
     */
    public function attributeIsEnabled(AttributeInterface $attribute): void
    {
        Assert::true($this->productPage->isAttributeEnabled($attribute));
    }
}
