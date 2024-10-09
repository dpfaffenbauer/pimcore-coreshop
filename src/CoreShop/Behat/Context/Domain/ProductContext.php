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
use CoreShop\Component\Core\Context\ShopperContextInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\ProductStoreValuesInterface;
use CoreShop\Component\Core\Product\TaxedProductPriceCalculatorInterface;
use CoreShop\Component\Product\Calculator\ProductPriceCalculatorInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\Taxation\Model\TaxRuleGroupInterface;
use Webmozart\Assert\Assert;

final class ProductContext implements Context
{
    public function __construct(
        private ShopperContextInterface $shopperContext,
        private ProductPriceCalculatorInterface $productPriceCalculator,
        private TaxedProductPriceCalculatorInterface $taxedProductPriceCalculator,
    ) {
    }

    /**
     * @Then /^the (product "[^"]+") should be priced at "([^"]+)"$/
     * @Then /^the (product) should be priced at "([^"]+)"$/
     * @Then /^the (variant) should be priced at "([^"]+)"$/
     * @Then /^the (version) should be priced at "([^"]+)"$/
     */
    public function productShouldBePriced(ProductInterface $product, int $price): void
    {
        Assert::same($price, $this->productPriceCalculator->getPrice($product, $this->shopperContext->getContext(), true));
    }

    /**
     * @Then /^the (product "[^"]+") discount-price should be "([^"]+)"$/
     * @Then /^the (product) discount-price should be "([^"]+)"$/
     * @Then /^the (variant) discount-price should be "([^"]+)"$/
     */
    public function productsDiscountPriceShouldBe(ProductInterface $product, int $price): void
    {
        Assert::same($price, $this->productPriceCalculator->getDiscountPrice($product, $this->shopperContext->getContext()));
    }

    /**
     * @Then /^the (product "[^"]+") retail-price should be "([^"]+)"$/
     * @Then /^the (product) retail-price should be "([^"]+)"$/
     * @Then /^the (variant) retail-price should be "([^"]+)"$/
     */
    public function productsRetailPriceShouldBe(ProductInterface $product, int $price): void
    {
        Assert::same($price, $this->productPriceCalculator->getRetailPrice($product, $this->shopperContext->getContext()));
    }

    /**
     * @Then /^the (product "[^"]+") discount should be "([^"]+)"$/
     * @Then /^the (product) discount should be "([^"]+)"$/
     * @Then /^the (variant) discount should be "([^"]+)"$/
     */
    public function productDiscountShouldBe(ProductInterface $product, int $discount): void
    {
        $productPrice = $this->productPriceCalculator->getPrice($product, $this->shopperContext->getContext(), false);
        $productDiscount = $this->productPriceCalculator->getDiscount($product, $this->shopperContext->getContext(), $productPrice);

        Assert::same($discount, $productDiscount);
    }

    /**
     * @Then /^the (product "[^"]+") should have the prices, price: "([^"]+)" and discount-price: "([^"]+)" and retail-price: "([^"]+)" and discount: "([^"]+)"$/
     * @Then /^the (product) should have the prices, price: "([^"]+)" and discount-price: "([^"]+)" and retail-price: "([^"]+)" and discount: "([^"]+)"$/
     * @Then /^the (variant) should have the prices, price: "([^"]+)" and discount-price: "([^"]+)" and retail-price: "([^"]+)" and discount: "([^"]+)"$/
     */
    public function productPricesShouldBe(ProductInterface $product, int $price, int $discountPrice, int $retailPrice, int $discount): void
    {
        $this->productShouldBePriced($product, $price);
        $this->productsDiscountPriceShouldBe($product, $discountPrice);
        $this->productsRetailPriceShouldBe($product, $retailPrice);
        $this->productDiscountShouldBe($product, $discount);
    }

    /**
     * @Then /^the (product "[^"]+") should have the prices, price: "([^"]+)" and retail-price: "([^"]+)" and discount: "([^"]+)"$/
     * @Then /^the (product) should have the prices, price: "([^"]+)" and retail-price: "([^"]+)" and discount: "([^"]+)"$/
     * @Then /^the (variant) should have the prices, price: "([^"]+)" and retail-price: "([^"]+)" and discount: "([^"]+)"$/
     */
    public function productPricesShouldBeExceptDiscountPrice(ProductInterface $product, int $price, int $retailPrice, int $discount): void
    {
        $this->productShouldBePriced($product, $price);
        $this->productsRetailPriceShouldBe($product, $retailPrice);
        $this->productDiscountShouldBe($product, $discount);
    }

    /**
     * @Then /^the (product "[^"]+") should be priced at "([^"]+)" including tax$/
     * @Then /^the (product) should be priced at "([^"]+)" including tax$/
     * @Then /^the (variant) should be priced at "([^"]+)" including tax$/
     */
    public function productTaxedPriceShouldBe(ProductInterface $product, int $price): void
    {
        Assert::same($price, $this->taxedProductPriceCalculator->getPrice($product, $this->shopperContext->getContext()));
    }

    /**
     * @Then /^the (product "[^"]+") retail-price should be "([^"]+)" including tax$/
     * @Then /^the (product) retail-price should be "([^"]+)" including tax$/
     * @Then /^the (variant) retail-price should be "([^"]+)" including tax$/
     */
    public function productTaxedRetailPriceShouldBe(ProductInterface $product, int $price): void
    {
        Assert::same($price, $this->taxedProductPriceCalculator->getRetailPrice($product, $this->shopperContext->getContext()));
    }

    /**
     * @Then /^the (product "[^"]+") should have (tax rule group "[^"]+")$/
     * @Then /^the (product) should have (tax rule group "[^"]+")$/
     * @Then /^the (variant) should have (tax rule group "[^"]+")$/
     */
    public function theProductShouldHaveTaxRuleGroup(ProductInterface $product, TaxRuleGroupInterface $taxRuleGroup): void
    {
        $taxRule = $product->getStoreValuesOfType('taxRule', $this->shopperContext->getStore());

        Assert::eq($taxRule?->getId(), $taxRuleGroup->getId());
    }

    /**
     * @Then /^the (products "[^"]+") default unit should be (unit "[^"]+")$/
     * @Then /^the (products) default unit should be (unit "[^"]+")$/
     * @Then /^the (variants) default unit should be (unit "[^"]+")$/
     */
    public function theProductsDefaultUnitShouldBe(ProductInterface $product, ProductUnitInterface $unit): void
    {
        $unitDefinitions = $product->getUnitDefinitions();

        Assert::notNull($unitDefinitions, 'Expected the products UnitDefinitions not to be null');

        $defaultUnitDefinition = $unitDefinitions->getDefaultUnitDefinition();

        Assert::eq(
            $defaultUnitDefinition->getUnit(),
            $unit,
            sprintf(
                'Expected the products default unit to be %s, but got %s',
                $unit->getName(),
                $defaultUnitDefinition->getUnitName(),
            ),
        );
    }

    /**
     * @Then /^the (product "[^"]+") should have and additional (unit "[^"]+") with conversion rate ("[^"]+")$/
     * @Then /^the (product) should have and additional (unit "[^"]+") with conversion rate ("[^"]+")$/
     * @Then /^the (variant) should have and additional (unit "[^"]+") with conversion rate ("[^"]+")$/
     */
    public function theProductsShouldHaveAnAdditionalUnitWithConversionRate(ProductInterface $product, ProductUnitInterface $unit, $conversionRate): void
    {
        $unitDefinitions = $product->getUnitDefinitions();

        Assert::notNull($unitDefinitions, 'Expected the products UnitDefinitions not to be null');

        $additionalUnitDefinitions = $unitDefinitions->getAdditionalUnitDefinitions();
        $found = false;

        foreach ($additionalUnitDefinitions as $unitDefinition) {
            if ($unitDefinition->getUnit() === $unit && (float) $conversionRate === $unitDefinition->getConversionRate()) {
                $found = true;
            }
        }

        Assert::true(
            $found,
            sprintf(
                'Expected the product to have an additional unit %s with conversion-rate %s',
                $unit->getName(),
                $conversionRate,
            ),
        );
    }

    /**
     * @Then /^the (product) and the (copied-object) should have it's own price$/
     */
    public function bothProductsShouldHaveItsOwnPrice(ProductInterface $originalProduct, ProductInterface $copiedObject): void
    {
        $storeValues = $originalProduct->getStoreValues();

        foreach ($storeValues as $storeValue) {
            if (!$storeValue instanceof ProductStoreValuesInterface) {
                continue;
            }

            Assert::eq($storeValue->getProduct()->getId(), $originalProduct->getId());
        }

        $copiedStoreValues = $copiedObject->getStoreValues();

        foreach ($copiedStoreValues as $copiedStoreValue) {
            if (!$copiedStoreValue instanceof ProductStoreValuesInterface) {
                continue;
            }

            Assert::eq($copiedStoreValue->getProduct()->getId(), $copiedObject->getId());
        }
    }
}
