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
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CountriesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CurrenciesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CustomerGroupsConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CustomersConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\StoresConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\ZonesConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\ProductSpecificPriceRuleConditionType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Condition\ProductSpecificPriceNestedConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Condition\TimespanConfigurationType;
use CoreShop\Bundle\ResourceBundle\Form\Registry\FormTypeRegistryInterface;
use CoreShop\Component\Address\Model\ZoneInterface;
use CoreShop\Component\Core\Model\CountryInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Model\CustomerInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\QuantityRangeInterface;
use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Core\Repository\ProductRepositoryInterface;
use CoreShop\Component\Customer\Model\CustomerGroupInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\ProductQuantityPriceRules\Model\ProductQuantityPriceRuleInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Rule\Model\ConditionInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Form\FormFactoryInterface;
use Webmozart\Assert\Assert;

final class ProductQuantityPriceRuleContext implements Context
{
    use ConditionFormTrait;

    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FactoryInterface $rangeFactory,
        private FormFactoryInterface $formFactory,
        private FormTypeRegistryInterface $conditionFormTypeRegistry,
        private FactoryInterface $productQuantityPriceRuleFactory,
        private ProductRepositoryInterface $productRepository,
    ) {
    }

    /**
     * @Given /^adding a quantity price rule to (product "[^"]+") named "([^"]+)" and with calculation-behaviour "([^"]+)"$/
     * @Given /^adding a quantity price rule to this (product) named "([^"]+)" with calculation-behaviour "([^"]+)"$/
     */
    public function addingAProductQuantityPriceRuleToProduct(
        ProductInterface $product,
        $ruleName,
        $calculationBehaviourName,
    ): void {
        /**
         * @var ProductQuantityPriceRuleInterface $rule
         */
        $rule = $this->productQuantityPriceRuleFactory->createNew();
        $rule->setName($ruleName);
        $rule->setProduct($product->getId());
        $rule->setCalculationBehaviour($calculationBehaviourName);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();

        $this->sharedStorage->set('product-quantity-price-rule', $rule);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") is active$/
     * @Given /^the (quantity price rule) is active$/
     */
    public function theProductQuantityPriceRuleIsActive(ProductQuantityPriceRuleInterface $rule): void
    {
        $rule->setActive(true);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") is inactive$/
     * @Given /^the (quantity price rule) is inactive$/
     */
    public function theProductQuantityPriceRuleIsInActive(ProductQuantityPriceRuleInterface $rule): void
    {
        $rule->setActive(false);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from ([^"]+) with behaviour percentage-decrease of ([^"]+)%$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour percentage-decrease of ([^"]+)%$/
     */
    public function theProductQuantityPriceRuleHasRangePercentageDecrease(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        float $percentage,
    ): void {
        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('percentage_decrease');
        $range->setPercentage($percentage);
        $range->setRangeStartingFrom($from);

        $this->addRange($rule, $range);

        $this->sharedStorage->set('quantity-price-rule-range', $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from to ([^"]+) with behaviour percentage-increase of ([^"]+)%$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour percentage-increase of ([^"]+)%$/
     */
    public function theProductQuantityPriceRuleHasRangePercentageIncrease(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        float $percentage,
    ): void {
        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('percentage_increase');
        $range->setPercentage($percentage);
        $range->setRangeStartingFrom($from);

        $this->addRange($rule, $range);

        $this->sharedStorage->set('quantity-price-rule-range', $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from ([^"]+) with behaviour amount-decrease of (\d+) in (currency "[^"]+")$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour amount-decrease of (\d+) in (currency "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasRangeAmountDecrease(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        int $amount,
        CurrencyInterface $currency,
    ): void {
        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('amount_decrease');
        $range->setAmount($amount);
        $range->setRangeStartingFrom($from);
        $range->setCurrency($currency);

        $this->addRange($rule, $range);

        $this->sharedStorage->set('quantity-price-rule-range', $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from ([^"]+) with behaviour amount-increase of (\d+) in (currency "[^"]+")$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour amount-increase of (\d+) in (currency "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasRangeAmountIncrease(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        int $amount,
        CurrencyInterface $currency,
    ): void {
        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('amount_increase');
        $range->setAmount($amount);
        $range->setRangeStartingFrom($from);
        $range->setCurrency($currency);

        $this->addRange($rule, $range);

        $this->sharedStorage->set('quantity-price-rule-range', $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from ([^"]+) with behaviour fixed of (\d+) in (currency "[^"]+")$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour fixed of (\d+) in (currency "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasRangeFixed(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        int $amount,
        CurrencyInterface $currency,
    ): void {
        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('fixed');
        $range->setAmount($amount);
        $range->setRangeStartingFrom($from);
        $range->setCurrency($currency);

        $this->addRange($rule, $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from ([^"]+) with behaviour percentage-decrease of (\d+)% for (unit "[^"]+")$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour percentage-decrease of (\d+)% for (unit "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasRangePercentageDecreaseForUnit(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        float $percentage,
        ProductUnitInterface $unit,
    ): void {
        $unitDefinition = $this->getUnitDefinitionFromProduct($rule->getProduct(), $unit);

        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('percentage_decrease');
        $range->setPercentage($percentage);
        $range->setRangeStartingFrom($from);
        $range->setUnitDefinition($unitDefinition);

        $this->addRange($rule, $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from to ([^"]+) with behaviour percentage-increase of ([^"]+)% (unit "[^"]+")$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour percentage-increase of ([^"]+)% (unit "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasRangePercentageIncreaseForUnit(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        $percentage,
        ProductUnitInterface $unit,
    ): void {
        $unitDefinition = $this->getUnitDefinitionFromProduct($rule->getProduct(), $unit);

        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('percentage_increase');
        $range->setPercentage($percentage);
        $range->setRangeStartingFrom($from);
        $range->setUnitDefinition($unitDefinition);

        $this->addRange($rule, $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from ([^"]+) with behaviour amount-decrease of ([^"]+) in (currency "[^"]+") (unit "[^"]+")$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour amount-decrease of ([^"]+) in (currency "[^"]+") (unit "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasRangeAmountDecreaseForUnit(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        $amount,
        CurrencyInterface $currency,
        ProductUnitInterface $unit,
    ): void {
        $unitDefinition = $this->getUnitDefinitionFromProduct($rule->getProduct(), $unit);

        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('amount_decrease');
        $range->setAmount($amount);
        $range->setRangeStartingFrom($from);
        $range->setCurrency($currency);
        $range->setUnitDefinition($unitDefinition);

        $this->addRange($rule, $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from ([^"]+) with behaviour amount-increase of ([^"]+) in (currency "[^"]+") (unit "[^"]+")$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour amount-increase of ([^"]+) in (currency "[^"]+") (unit "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasRangeAmountIncreaseForUnit(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        $amount,
        CurrencyInterface $currency,
        ProductUnitInterface $unit,
    ): void {
        $unitDefinition = $this->getUnitDefinitionFromProduct($rule->getProduct(), $unit);

        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('amount_increase');
        $range->setAmount($amount);
        $range->setRangeStartingFrom($from);
        $range->setCurrency($currency);
        $range->setUnitDefinition($unitDefinition);

        $this->addRange($rule, $range);
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a range starting from ([^"]+) with behaviour fixed of ([^"]+) in (currency "[^"]+") (unit "[^"]+")$/
     * @Given /^the (quantity price rule) has a range starting from ([^"]+) with behaviour fixed of ([^"]+) in (currency "[^"]+") (unit "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasRangeFixedForUnit(
        ProductQuantityPriceRuleInterface $rule,
        int $from,
        $amount,
        CurrencyInterface $currency,
        ProductUnitInterface $unit,
    ): void {
        $unitDefinition = $this->getUnitDefinitionFromProduct($rule->getProduct(), $unit);

        /**
         * @var QuantityRangeInterface $range
         */
        $range = $this->rangeFactory->createNew();
        $range->setPricingBehaviour('fixed');
        $range->setAmount($amount);
        $range->setRangeStartingFrom($from);
        $range->setCurrency($currency);
        $range->setUnitDefinition($unitDefinition);

        $this->addRange($rule, $range);

        $this->sharedStorage->set('quantity-price-rule-range', $range);
    }

    /**
     * @Given /^the (price range) is only valid for (unit "[^"]+")$/
     */
    public function theQuantityPriceRangeIsValidForUnit(QuantityRangeInterface $range, ProductUnitInterface $unit): void
    {
        $productId = $range->getRule()->getProduct();
        /**
         * @var ProductInterface $product
         */
        $product = $this->productRepository->find($productId);

        Assert::notNull($product);

        $unitDefinition = $this->findUnitDefinition($product, $unit);

        $range->setUnitDefinition($unitDefinition);

        $this->objectManager->persist($range);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition countries with (country "[^"]+")$/
     * @Given /^the (quantity price rule) has a condition countries with (country "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasACountriesCondition(
        ProductQuantityPriceRuleInterface $rule,
        CountryInterface $country,
    ): void {
        $this->assertConditionForm(CountriesConfigurationType::class, 'countries');

        $this->addCondition($rule, $this->createConditionWithForm('countries', [
            'countries' => [
                $country->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition customers with (customer "[^"]+")$/
     * @Given /^the (quantity price rule) has a condition customers with (customer "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasACustomerCondition(
        ProductQuantityPriceRuleInterface $rule,
        CustomerInterface $customer,
    ): void {
        $this->assertConditionForm(CustomersConfigurationType::class, 'customers');

        $this->addCondition($rule, $this->createConditionWithForm('customers', [
            'customers' => [
                $customer->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition timespan which is valid from "([^"]+") to "([^"]+)"$/
     * @Given /^the (quantity price rule) has a condition timespan which is valid from "([^"]+)" to "([^"]+)"$/
     */
    public function theProductQuantityPriceRuleHasATimeSpanCondition(
        ProductQuantityPriceRuleInterface $rule,
        $from,
        $to,
    ): void {
        $this->assertConditionForm(TimespanConfigurationType::class, 'timespan');

        $from = new \DateTime($from);
        $to = new \DateTime($to);

        $this->addCondition($rule, $this->createConditionWithForm('timespan', [
            'dateFrom' => $from->getTimestamp() * 1000,
            'dateTo' => $to->getTimestamp() * 1000,
        ]));
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition customer-groups with (customer-group "[^"]+")$/
     * @Given /^the (quantity price rule) has a condition customer-groups with (customer-group "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasACustomerGroupCondition(
        ProductQuantityPriceRuleInterface $rule,
        CustomerGroupInterface $group,
    ): void {
        $this->assertConditionForm(CustomerGroupsConfigurationType::class, 'customerGroups');

        $this->addCondition($rule, $this->createConditionWithForm('customerGroups', [
            'customerGroups' => [
                $group->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition stores with (store "[^"]+")$/
     * @Given /^the (quantity price rule) has a condition stores with (store "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasAStoreCondition(
        ProductQuantityPriceRuleInterface $rule,
        StoreInterface $store,
    ): void {
        $this->assertConditionForm(StoresConfigurationType::class, 'stores');

        $this->addCondition($rule, $this->createConditionWithForm('stores', [
            'stores' => [
                $store->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition zones with (zone "[^"]+")$/
     * @Given /^the (quantity price rule) has a condition zones with (zone "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasAZoneCondition(
        ProductQuantityPriceRuleInterface $rule,
        ZoneInterface $zone,
    ): void {
        $this->assertConditionForm(ZonesConfigurationType::class, 'zones');

        $this->addCondition($rule, $this->createConditionWithForm('zones', [
            'zones' => [
                $zone->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition currencies with (currency "[^"]+")$/
     * @Given /^the (quantity price rule) has a condition currencies with (currency "[^"]+")$/
     */
    public function theProductsQuantityPriceRuleHasACurrencyCondition(
        ProductQuantityPriceRuleInterface $rule,
        CurrencyInterface $currency,
    ): void {
        $this->assertConditionForm(CurrenciesConfigurationType::class, 'currencies');

        $this->addCondition($rule, $this->createConditionWithForm('currencies', [
            'currencies' => [
                $currency->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition nested with operator "([^"]+)" for (store "[^"]+") and (store "[^"]+")$/
     * @Given /^the (quantity price rule) has a condition nested with operator "([^"]+)" for (store "[^"]+") and (store "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasANestedConditionWithStores(
        ProductQuantityPriceRuleInterface $rule,
        $operator,
        StoreInterface $store1,
        StoreInterface $store2,
    ): void {
        $this->assertConditionForm(ProductSpecificPriceNestedConfigurationType::class, 'nested');

        $this->addCondition($rule, $this->createConditionWithForm('nested', [
            'operator' => $operator,
            'conditions' => [
                [
                    'type' => 'stores',
                    'configuration' => [
                        'stores' => [
                            $store1->getId(),
                        ],
                    ],
                ],
                [
                    'type' => 'stores',
                    'configuration' => [
                        'stores' => [
                            $store2->getId(),
                        ],
                    ],
                ],
            ],
        ]));
    }

    /**
     * @Given /^the (quantity price rule "[^"]+") has a condition nested with operator "([^"]+)" for (store "[^"]+") and (country "[^"]+")$/
     * @Given /^the (quantity price rule) has a condition nested with operator "([^"]+)" for (store "[^"]+") and (country "[^"]+")$/
     */
    public function theProductQuantityPriceRuleHasANestedConditionWithStoreAndCountry(
        ProductQuantityPriceRuleInterface $rule,
        $operator,
        StoreInterface $store,
        CountryInterface $country,
    ): void {
        $this->assertConditionForm(ProductSpecificPriceNestedConfigurationType::class, 'nested');

        $this->addCondition($rule, $this->createConditionWithForm('nested', [
            'operator' => $operator,
            'conditions' => [
                [
                    'type' => 'stores',
                    'configuration' => [
                        'stores' => [
                            $store->getId(),
                        ],
                    ],
                ],
                [
                    'type' => 'countries',
                    'configuration' => [
                        'countries' => [
                            $country->getId(),
                        ],
                    ],
                ],
            ],
        ]));
    }

    private function getUnitDefinitionFromProduct(int $productId, ProductUnitInterface $unit)
    {
        $product = $this->productRepository->find($productId);

        Assert::isInstanceOf($product, ProductInterface::class);

        foreach ($product->getUnitDefinitions()->getUnitDefinitions() as $unitDefinition) {
            if ($unitDefinition->getUnit()->getName() === $unit->getName()) {
                return $unitDefinition;
            }
        }

        throw new \Exception(sprintf(
            'Unit %s in product %s (%s) not found',
            $unit->getName(),
            $product->getName(),
            $product->getId(),
        ));
    }

    private function addCondition(ProductQuantityPriceRuleInterface $rule, ConditionInterface $condition): void
    {
        $rule->addCondition($condition);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    private function addRange(ProductQuantityPriceRuleInterface $rule, QuantityRangeInterface $range): void
    {
        $rule->addRange($range);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    protected function findUnitDefinition(ProductInterface $product, ProductUnitInterface $unit)
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

    protected function getConditionFormRegistry(): FormTypeRegistryInterface
    {
        return $this->conditionFormTypeRegistry;
    }

    protected function getConditionFormClass(): string
    {
        return ProductSpecificPriceRuleConditionType::class;
    }

    protected function getFormFactory(): FormFactoryInterface
    {
        return $this->formFactory;
    }
}
