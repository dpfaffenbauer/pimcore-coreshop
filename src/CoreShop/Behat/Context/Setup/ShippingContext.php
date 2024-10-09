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
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CategoriesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CountriesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CurrenciesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CustomerGroupsConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CustomersConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\ProductsConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\StoresConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\ZonesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Shipping\Rule\Action\AdditionAmountActionConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Shipping\Rule\Action\DiscountAmountActionConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Shipping\Rule\Action\PriceActionConfigurationType;
use CoreShop\Bundle\ResourceBundle\Form\Registry\FormTypeRegistryInterface;
use CoreShop\Bundle\RuleBundle\Form\Type\Rule\EmptyConfigurationFormType;
use CoreShop\Bundle\ShippingBundle\Form\Type\Rule\Action\AdditionPercentActionConfigurationType;
use CoreShop\Bundle\ShippingBundle\Form\Type\Rule\Action\DiscountPercentActionConfigurationType;
use CoreShop\Bundle\ShippingBundle\Form\Type\Rule\Condition\AmountConfigurationType;
use CoreShop\Bundle\ShippingBundle\Form\Type\Rule\Condition\DimensionConfigurationType;
use CoreShop\Bundle\ShippingBundle\Form\Type\Rule\Condition\PostcodeConfigurationType;
use CoreShop\Bundle\ShippingBundle\Form\Type\Rule\Condition\WeightConfigurationType;
use CoreShop\Bundle\ShippingBundle\Form\Type\ShippingRuleActionType;
use CoreShop\Bundle\ShippingBundle\Form\Type\ShippingRuleConditionType;
use CoreShop\Component\Address\Model\ZoneInterface;
use CoreShop\Component\Core\Model\CarrierInterface;
use CoreShop\Component\Core\Model\CategoryInterface;
use CoreShop\Component\Core\Model\CountryInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Model\CustomerInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Customer\Model\CustomerGroupInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Rule\Model\ActionInterface;
use CoreShop\Component\Rule\Model\ConditionInterface;
use CoreShop\Component\Shipping\Model\ShippingRuleGroupInterface;
use CoreShop\Component\Shipping\Model\ShippingRuleInterface;
use CoreShop\Component\Taxation\Model\TaxRuleGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Form\FormFactoryInterface;

final class ShippingContext implements Context
{
    use ConditionFormTrait;
    use ActionFormTrait;

    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FormFactoryInterface $formFactory,
        private FormTypeRegistryInterface $conditionFormTypeRegistry,
        private FormTypeRegistryInterface $actionFormTypeRegistry,
        private FactoryInterface $carrierFactory,
        private FactoryInterface $shippingRuleFactory,
        private FactoryInterface $shippingRuleGroupFactory,
    ) {
    }

    /**
     * @Given /^the site has a carrier "([^"]+)"$/
     * @Given /^the site has another carrier "([^"]+)"$/
     */
    public function theSiteHasACarrier($name): void
    {
        $this->createCarrier($name);
    }

    /**
     * @Given /^the site has a carrier "([^"]+)" and ships for (\d+) in (currency "[^"]+")$/
     */
    public function theSiteHasACarrierAndShipsForX($name, int $price, CurrencyInterface $currency): void
    {
        $carrier = $this->createCarrier($name);

        /**
         * @var ShippingRuleInterface $rule
         */
        $rule = $this->shippingRuleFactory->createNew();
        $rule->setName($name);
        $rule->setActive(true);

        $this->assertActionForm(PriceActionConfigurationType::class, 'price');

        $this->addAction($rule, $this->createActionWithForm('price', [
            'price' => $price,
            'currency' => $currency->getId(),
        ]));

        $shippingRuleGroup = $this->shippingRuleGroupFactory->createNew();
        $shippingRuleGroup->setShippingRule($rule);
        $shippingRuleGroup->setPriority(1);

        $carrier->addShippingRule($shippingRuleGroup);

        $this->objectManager->persist($carrier);
        $this->objectManager->persist($shippingRuleGroup);
        $this->objectManager->persist($rule);
        $this->objectManager->flush();

        $this->sharedStorage->set('shipping-rule', $rule);
    }

    /**
     * @Given /^the (carrier "[^"]+") is disabled for (store "[^"]+")$/
     * @Given /^the (carrier) is disabled for  (store "[^"]+")$/
     */
    public function theCarrierIsDisabledForStore(CarrierInterface $carrier, StoreInterface $store): void
    {
        $carrier->removeStore($store);

        $this->saveCarrier($carrier);
    }

    /**
     * @Given /^the (carrier "[^"]+") is enabled for (store "[^"]+")$/
     * @Given /^the (carrier) is enabled for  (store "[^"]+")$/
     */
    public function theCarrierIsEnabledForStore(CarrierInterface $carrier, StoreInterface $store): void
    {
        $carrier->addStore($store);

        $this->saveCarrier($carrier);
    }

    /**
     * @Given /^the (carrier "[^"]+") has (tax rule group "[^"]+")$/
     * @Given /^the (carrier) has the (tax rule group "[^"]+")$/
     */
    public function theCarrierHasTheTaxRuleGroup(CarrierInterface $carrier, TaxRuleGroupInterface $taxRuleGroup): void
    {
        $carrier->setTaxRule($taxRuleGroup);

        $this->saveCarrier($carrier);
    }

    /**
     * @Given /^adding a shipping rule named "([^"]+)"$/
     */
    public function addingAShippingRule($ruleName): void
    {
        /**
         * @var ShippingRuleInterface $rule
         */
        $rule = $this->shippingRuleFactory->createNew();
        $rule->setName($ruleName);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();

        $this->sharedStorage->set('shipping-rule', $rule);
    }

    /**
     * @Given /^the (shipping rule "[^"]+") is active$/
     * @Given /^the (shipping rule) is active$/
     */
    public function theShippingRuleIsActive(ShippingRuleInterface $rule): void
    {
        $rule->setActive(true);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (shipping rule "[^"]+") is inactive$/
     * @Given /^the (shipping rule) is inactive$/
     */
    public function theShippingRuleIsInActive(ShippingRuleInterface $rule): void
    {
        $rule->setActive(false);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (shipping rule "[^"]+") belongs to (carrier "[^"]+")$/
     * @Given /^the (shipping rule) belongs to (carrier "[^"]+")$/
     */
    public function addingShippingRuleToCarrier(ShippingRuleInterface $shippingRule, CarrierInterface $carrier): void
    {
        /**
         * @var ShippingRuleGroupInterface $shippingRuleGroup
         */
        $shippingRuleGroup = $this->shippingRuleGroupFactory->createNew();
        $shippingRuleGroup->setShippingRule($shippingRule);
        $shippingRuleGroup->setPriority(1);

        $carrier->addShippingRule($shippingRuleGroup);

        $this->saveCarrier($carrier);
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition amount from "([^"]+)" to "([^"]+)"$/
     * @Given /^the (shipping rule) has a condition amount from "([^"]+)" to "([^"]+)"$/
     */
    public function theShippingRuleHasAAmountCondition(ShippingRuleInterface $rule, $minAmount, $maxAmount): void
    {
        $this->assertConditionForm(AmountConfigurationType::class, 'amount');

        $this->addCondition($rule, $this->createConditionWithForm('amount', [
            'minAmount' => $minAmount,
            'maxAmount' => $maxAmount,
            'gross' => true,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition amount from "([^"]+)" to "([^"]+)" which is net$/
     * @Given /^the (shipping rule) has a condition amount from "([^"]+)" to "([^"]+)" which is net$/
     */
    public function theShippingRuleHasAAmountConditionWhichIsNet(ShippingRuleInterface $rule, $minAmount, $maxAmount): void
    {
        $this->assertConditionForm(AmountConfigurationType::class, 'amount');

        $this->addCondition($rule, $this->createConditionWithForm('amount', [
            'minAmount' => $minAmount,
            'maxAmount' => $maxAmount,
            'gross' => false,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition amount from total "([^"]+)" to "([^"]+)"$/
     * @Given /^the (shipping rule) has a condition amount from total "([^"]+)" to "([^"]+)"$/
     */
    public function theShippingRuleHasAAmountFromTotalCondition(ShippingRuleInterface $rule, $minAmount, $maxAmount): void
    {
        $this->assertConditionForm(AmountConfigurationType::class, 'amount');

        $this->addCondition($rule, $this->createConditionWithForm('amount', [
            'minAmount' => $minAmount,
            'maxAmount' => $maxAmount,
            'gross' => true,
            'useTotal' => true,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition amount from total "([^"]+)" to "([^"]+)" which is net$/
     * @Given /^the (shipping rule) has a condition amount from total "([^"]+)" to "([^"]+)" which is net$/
     */
    public function theShippingRuleHasAAmountFromTotalConditionWhichIsNet(ShippingRuleInterface $rule, $minAmount, $maxAmount): void
    {
        $this->assertConditionForm(AmountConfigurationType::class, 'amount');

        $this->addCondition($rule, $this->createConditionWithForm('amount', [
            'minAmount' => $minAmount,
            'maxAmount' => $maxAmount,
            'gross' => false,
            'useTotal' => true,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition postcode with "([^"]+)"$/
     * @Given /^the (shipping rule) has a condition postcode with "([^"]+)"$/
     */
    public function theShippingRuleHasAPostcodeCondition(ShippingRuleInterface $rule, $postcodes): void
    {
        $this->assertConditionForm(PostcodeConfigurationType::class, 'postcodes');

        $this->addCondition($rule, $this->createConditionWithForm('postcodes', [
            'postcodes' => $postcodes,
            'exclusion' => false,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition postcode exclusion with "([^"]+)"$/
     * @Given /^the (shipping rule) has a condition postcode exclusion with "([^"]+)"$/
     */
    public function theShippingRuleHasAPostcodeExclusionCondition(ShippingRuleInterface $rule, $postcodes): void
    {
        $this->assertConditionForm(PostcodeConfigurationType::class, 'postcodes');

        $this->addCondition($rule, $this->createConditionWithForm('postcodes', [
            'postcodes' => $postcodes,
            'exclusion' => true,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition weight from "([^"]+)" to "([^"]+)"$/
     * @Given /^the (shipping rule) has a condition weight from "([^"]+)" to "([^"]+)"$/
     */
    public function theShippingRuleHasAWeightCondition(ShippingRuleInterface $rule, $minWeight, $maxWeight): void
    {
        $this->assertConditionForm(WeightConfigurationType::class, 'weight');

        $this->addCondition($rule, $this->createConditionWithForm('weight', [
            'minWeight' => $minWeight,
            'maxWeight' => $maxWeight,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition dimension with ([^"]+)x([^"]+)x([^"]+)$/
     * @Given /^the (shipping rule) has a condition dimension with ([^"]+)x([^"]+)x([^"]+)$/
     */
    public function theShippingRuleHasADimensionCondition(ShippingRuleInterface $rule, $width, $height, $depth): void
    {
        $this->assertConditionForm(DimensionConfigurationType::class, 'dimension');

        $this->addCondition($rule, $this->createConditionWithForm('dimension', [
            'width' => $width,
            'height' => $height,
            'depth' => $depth,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition categories with (category "[^"]+")$/
     * @Given /^the (shipping rule) has a condition categories with (category "[^"]+")$/
     */
    public function theShippingRuleHasACategoriesCondition(ShippingRuleInterface $rule, CategoryInterface $category): void
    {
        $this->assertConditionForm(CategoriesConfigurationType::class, 'categories');

        $this->addCondition($rule, $this->createConditionWithForm('categories', [
            'categories' => [$category->getId()],
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition categories with (category "[^"]+") and it is recursive$/
     * @Given /^the (shipping rule) has a condition categories with (category "[^"]+") and it is recursive$/
     */
    public function theShippingRuleHasACategoriesConditionAndItIsRecursive(ShippingRuleInterface $rule, CategoryInterface $category): void
    {
        $this->assertConditionForm(CategoriesConfigurationType::class, 'categories');

        $this->addCondition($rule, $this->createConditionWithForm('categories', [
            'categories' => [$category->getId()],
            'recursive' => true,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition categories with (categories "[^"]+", "[^"]+")$/
     * @Given /^the (shipping rule) has a condition categories with (categories "[^"]+", "[^"]+")$/
     */
    public function theShippingRuleHasACategoriesConditionWithTwoCategories(ShippingRuleInterface $rule, array $categories): void
    {
        $this->assertConditionForm(CategoriesConfigurationType::class, 'categories');

        $this->addCondition($rule, $this->createConditionWithForm('categories', [
            'categories' => array_map(function ($category) {
                return $category->getId();
            }, $categories),
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition products with (product "[^"]+")$/
     * @Given /^the (shipping rule) has a condition products with (product "[^"]+")$/
     */
    public function theShippingRuleHasAProductsCondition(ShippingRuleInterface $rule, ProductInterface $product): void
    {
        $this->assertConditionForm(ProductsConfigurationType::class, 'products');

        $this->addCondition($rule, $this->createConditionWithForm('products', [
            'products' => [$product->getId()],
            'include_variants' => false,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition products with (product "[^"]+") which includes variants$/
     * @Given /^the (shipping rule) has a condition products with (product "[^"]+") which includes variants$/
     */
    public function theShippingRuleHasAProductsWithVariantsCondition(ShippingRuleInterface $rule, ProductInterface $product): void
    {
        $this->assertConditionForm(ProductsConfigurationType::class, 'products');

        $this->addCondition($rule, $this->createConditionWithForm('products', [
            'products' => [$product->getId()],
            'include_variants' => true,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition products with (products "[^"]+", "[^"]+")$/
     * @Given /^the (shipping rule) has a condition products with (products "[^"]+", "[^"]+")$/
     */
    public function theShippingRuleHasAProductsConditionWithTwoProducts(ShippingRuleInterface $rule, array $products): void
    {
        $this->assertConditionForm(ProductsConfigurationType::class, 'products');

        $this->addCondition($rule, $this->createConditionWithForm('products', [
            'products' => array_map(function ($product) {
                return $product->getId();
            }, $products),
            'include_variants' => false,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition products with (products "[^"]+", "[^"]+") which includes variants$/
     * @Given /^the (shipping rule) has a condition products with (products "[^"]+", "[^"]+") which includes variants$/
     */
    public function theShippingRuleHasAProductsConditionWithTwoProductsWithVariants(ShippingRuleInterface $rule, array $products): void
    {
        $this->assertConditionForm(ProductsConfigurationType::class, 'products');

        $this->addCondition($rule, $this->createConditionWithForm('products', [
            'products' => array_map(function ($product) {
                return $product->getId();
            }, $products),
            'include_variants' => true,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition countries with (country "[^"]+")$/
     * @Given /^the (shipping rule) has a condition countries with (country "[^"]+")$/
     */
    public function theShippingRuleHasACountriesCondition(ShippingRuleInterface $rule, CountryInterface $country): void
    {
        $this->assertConditionForm(CountriesConfigurationType::class, 'countries');

        $this->addCondition($rule, $this->createConditionWithForm('countries', [
            'countries' => [$country->getId()],
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition customers with (customer "[^"]+")$/
     * @Given /^the (shipping rule) has a condition customers with (customer "[^"]+")$/
     */
    public function theShippingRuleHasACustomersCondition(ShippingRuleInterface $rule, CustomerInterface $customer): void
    {
        $this->assertConditionForm(CustomersConfigurationType::class, 'customers');

        $this->addCondition($rule, $this->createConditionWithForm('customers', [
            'customers' => [$customer->getId()],
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition customer-groups with (customer-group "[^"]+")$/
     * @Given /^the (shipping rule) has a condition customer-groups with (customer-group "[^"]+")$/
     */
    public function theShippingRuleHasACustomerGroupsCondition(ShippingRuleInterface $rule, CustomerGroupInterface $customerGroup): void
    {
        $this->assertConditionForm(CustomerGroupsConfigurationType::class, 'customerGroups');

        $this->addCondition($rule, $this->createConditionWithForm('customerGroups', [
            'customerGroups' => [$customerGroup->getId()],
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition guest$/
     * @Given /^the (shipping rule) has a condition guest$/
     */
    public function theShippingRuleHasAGuestCondition(ShippingRuleInterface $rule): void
    {
        $this->assertConditionForm(EmptyConfigurationFormType::class, 'guest');

        $this->addCondition($rule, $this->createConditionWithForm('guest', []));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition zones with (zone "[^"]+")$/
     * @Given /^the (shipping rule) has a condition zones with (zone "[^"]+")$/
     */
    public function theShippingRuleHasAZonesCondition(ShippingRuleInterface $rule, ZoneInterface $zone): void
    {
        $this->assertConditionForm(ZonesConfigurationType::class, 'zones');

        $this->addCondition($rule, $this->createConditionWithForm('zones', [
            'zones' => [$zone->getId()],
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition stores with (store "[^"]+")$/
     * @Given /^the (shipping rule) has a condition stores with (store "[^"]+")$/
     */
    public function theShippingRuleHasAStoresCondition(ShippingRuleInterface $rule, StoreInterface $store): void
    {
        $this->assertConditionForm(StoresConfigurationType::class, 'stores');

        $this->addCondition($rule, $this->createConditionWithForm('stores', [
            'stores' => [$store->getId()],
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a condition currencies with (currency "[^"]+")$/
     * @Given /^the (shipping rule) has a condition currencies with (currency "[^"]+")$/
     */
    public function theShippingRuleHasACurrenciesCondition(ShippingRuleInterface $rule, CurrencyInterface $currency): void
    {
        $this->assertConditionForm(CurrenciesConfigurationType::class, 'currencies');

        $this->addCondition($rule, $this->createConditionWithForm('currencies', [
            'currencies' => [$currency->getId()],
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a action price of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (shipping rule) has a action price of ([^"]+) in (currency "[^"]+")$/
     */
    public function theShippingRuleHasAPriceAction(ShippingRuleInterface $rule, $price, CurrencyInterface $currency): void
    {
        $this->assertActionForm(PriceActionConfigurationType::class, 'price');

        $this->addAction($rule, $this->createActionWithForm('price', [
            'price' => (int) $price,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a action additional-amount of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (shipping rule) has a action additional-amount of ([^"]+) in (currency "[^"]+")$/
     */
    public function theShippingRuleHasAAdditionalAmountAction(ShippingRuleInterface $rule, $amount, CurrencyInterface $currency): void
    {
        $this->assertActionForm(AdditionAmountActionConfigurationType::class, 'additionAmount');

        $this->addAction($rule, $this->createActionWithForm('additionAmount', [
            'amount' => (int) $amount,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a action additional-percent of ([^"]+)%$/
     * @Given /^the (shipping rule) has a action additional-percent of ([^"]+)%$/
     */
    public function theShippingRuleHasAAdditionalPercentAction(ShippingRuleInterface $rule, $amount): void
    {
        $this->assertActionForm(AdditionPercentActionConfigurationType::class, 'additionPercent');

        $this->addAction($rule, $this->createActionWithForm('additionPercent', [
            'percent' => (int) $amount,
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a action discount-amount of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (shipping rule) has a action discount-amount of ([^"]+) in (currency "[^"]+")$/
     */
    public function theShippingRuleHasADiscountAmountAction(ShippingRuleInterface $rule, $amount, CurrencyInterface $currency): void
    {
        $this->assertActionForm(DiscountAmountActionConfigurationType::class, 'discountAmount');

        $this->addAction($rule, $this->createActionWithForm('discountAmount', [
            'amount' => (int) $amount,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (shipping rule "[^"]+") has a action discount-percent of ([^"]+)%$/
     * @Given /^the (shipping rule) has a action discount-percent of ([^"]+)%$/
     */
    public function theShippingRuleHasADiscountPercentAction(ShippingRuleInterface $rule, $amount): void
    {
        $this->assertActionForm(DiscountPercentActionConfigurationType::class, 'discountPercent');

        $this->addAction($rule, $this->createActionWithForm('discountPercent', [
            'percent' => (int) $amount,
        ]));
    }

    /**
     * @Given /^the (carrier) uses the tax calculation strategy "([^"]+)"$/
     */
    public function theCarrierUsedTheTaxCalculationStrategy(CarrierInterface $carrier, string $strategyKey): void
    {
        $carrier->setTaxCalculationStrategy($strategyKey);
    }

    private function createCarrier(string $name): CarrierInterface
    {
        /**
         * @var CarrierInterface $carrier
         */
        $carrier = $this->carrierFactory->createNew();
        $carrier->setIdentifier($name);
        $carrier->setTitle($name, 'en');
        $carrier->setTaxCalculationStrategy('taxRule');

        if ($this->sharedStorage->has('store')) {
            $carrier->addStore($this->sharedStorage->get('store'));
        }

        $this->saveCarrier($carrier);

        return $carrier;
    }

    private function saveCarrier(CarrierInterface $carrier): void
    {
        $this->objectManager->persist($carrier);
        $this->objectManager->flush();

        $this->sharedStorage->set('carrier', $carrier);
    }

    private function addCondition(ShippingRuleInterface $rule, ConditionInterface $condition): void
    {
        $rule->addCondition($condition);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    private function addAction(ShippingRuleInterface $rule, ActionInterface $action): void
    {
        $rule->addAction($action);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    protected function getConditionFormRegistry(): FormTypeRegistryInterface
    {
        return $this->conditionFormTypeRegistry;
    }

    protected function getConditionFormClass(): string
    {
        return ShippingRuleConditionType::class;
    }

    protected function getActionFormRegistry(): FormTypeRegistryInterface
    {
        return $this->actionFormTypeRegistry;
    }

    protected function getActionFormClass(): string
    {
        return ShippingRuleActionType::class;
    }

    protected function getFormFactory(): FormFactoryInterface
    {
        return $this->formFactory;
    }
}
