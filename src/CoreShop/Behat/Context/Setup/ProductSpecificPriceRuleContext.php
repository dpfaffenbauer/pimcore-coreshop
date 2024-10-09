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
use CoreShop\Bundle\ProductBundle\Form\Type\ProductSpecificPriceRuleActionType;
use CoreShop\Bundle\ProductBundle\Form\Type\ProductSpecificPriceRuleConditionType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Action\DiscountAmountConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Action\DiscountPercentConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Action\PriceConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Condition\ProductSpecificPriceNestedConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Condition\TimespanConfigurationType;
use CoreShop\Bundle\ResourceBundle\Form\Registry\FormTypeRegistryInterface;
use CoreShop\Bundle\RuleBundle\Form\Type\Rule\EmptyConfigurationFormType;
use CoreShop\Component\Address\Model\ZoneInterface;
use CoreShop\Component\Core\Model\CountryInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Model\CustomerInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Customer\Model\CustomerGroupInterface;
use CoreShop\Component\Product\Model\ProductSpecificPriceRuleInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Rule\Model\ActionInterface;
use CoreShop\Component\Rule\Model\ConditionInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Form\FormFactoryInterface;

final class ProductSpecificPriceRuleContext implements Context
{
    use ConditionFormTrait;
    use ActionFormTrait;

    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FormFactoryInterface $formFactory,
        private FormTypeRegistryInterface $conditionFormTypeRegistry,
        private FormTypeRegistryInterface $actionFormTypeRegistry,
        private FactoryInterface $productSpecificPriceRuleFactory,
    ) {
    }

    /**
     * @Given /^adding a product specific price rule to (product "[^"]+") named "([^"]+)"$/
     * @Given /^adding a product specific price rule to this (product) named "([^"]+)"$/
     */
    public function addingAProductSpecificPriceRuleToProduct(ProductInterface $product, $ruleName): void
    {
        /**
         * @var ProductSpecificPriceRuleInterface $rule
         */
        $rule = $this->productSpecificPriceRuleFactory->createNew();
        $rule->setName($ruleName);
        $rule->setProduct($product->getId());

        $this->objectManager->persist($rule);
        $this->objectManager->flush();

        $this->sharedStorage->set('product-specific-price-rule', $rule);
    }

    /**
     * @Given /^the (specific price rule "[^"]+") is active$/
     * @Given /^the (specific price rule) is active$/
     */
    public function theProductsSpecificPriceRuleIsActive(ProductSpecificPriceRuleInterface $rule): void
    {
        $rule->setActive(true);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (specific price rule "[^"]+") is inactive$/
     * @Given /^the (specific price rule) is inactive$/
     */
    public function theProductsSpecificPriceRuleIsInActive(ProductSpecificPriceRuleInterface $rule): void
    {
        $rule->setActive(false);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition countries with (country "[^"]+")$/
     * @Given /^the (specific price rule) has a condition countries with (country "[^"]+")$/
     */
    public function theProductsSpecificPriceRuleHasACountriesCondition(ProductSpecificPriceRuleInterface $rule, CountryInterface $country): void
    {
        $this->assertConditionForm(CountriesConfigurationType::class, 'countries');

        $this->addCondition($rule, $this->createConditionWithForm('countries', [
            'countries' => [
                $country->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition customers with (customer "[^"]+")$/
     * @Given /^the (specific price rule) has a condition customers with (customer "[^"]+")$/
     */
    public function theProductsSpecificPriceRuleHasACustomerCondition(ProductSpecificPriceRuleInterface $rule, CustomerInterface $customer): void
    {
        $this->assertConditionForm(CustomersConfigurationType::class, 'customers');

        $this->addCondition($rule, $this->createConditionWithForm('customers', [
            'customers' => [
                $customer->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition guest$/
     * @Given /^the (specific price rule) has a condition guest$/
     */
    public function theProductsSpecificPriceRuleHasAGuestCondition(ProductSpecificPriceRuleInterface $rule): void
    {
        $this->assertConditionForm(EmptyConfigurationFormType::class, 'guest');

        $this->addCondition($rule, $this->createConditionWithForm('guest', []));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition timespan which is valid from "([^"]+") to "([^"]+)"$/
     * @Given /^the (specific price rule) has a condition timespan which is valid from "([^"]+)" to "([^"]+)"$/
     */
    public function theProductsSpecificPriceRuleHasATimeSpanCondition(ProductSpecificPriceRuleInterface $rule, $from, $to): void
    {
        $this->assertConditionForm(TimespanConfigurationType::class, 'timespan');

        $from = new \DateTime($from);
        $to = new \DateTime($to);

        $this->addCondition($rule, $this->createConditionWithForm('timespan', [
            'dateFrom' => $from->getTimestamp() * 1000,
            'dateTo' => $to->getTimestamp() * 1000,
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition customer-groups with (customer-group "[^"]+")$/
     * @Given /^the (specific price rule) has a condition customer-groups with (customer-group "[^"]+")$/
     */
    public function theProductsSpecificPriceRuleHasACustomerGroupCondition(ProductSpecificPriceRuleInterface $rule, CustomerGroupInterface $group): void
    {
        $this->assertConditionForm(CustomerGroupsConfigurationType::class, 'customerGroups');

        $this->addCondition($rule, $this->createConditionWithForm('customerGroups', [
            'customerGroups' => [
                $group->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition stores with (store "[^"]+")$/
     * @Given /^the (specific price rule) has a condition stores with (store "[^"]+")$/
     */
    public function theProductsSpecificPriceRuleHasAStoreCondition(ProductSpecificPriceRuleInterface $rule, StoreInterface $store): void
    {
        $this->assertConditionForm(StoresConfigurationType::class, 'stores');

        $this->addCondition($rule, $this->createConditionWithForm('stores', [
            'stores' => [
                $store->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition zones with (zone "[^"]+")$/
     * @Given /^the (specific price rule) has a condition zones with (zone "[^"]+")$/
     */
    public function theProductsSpecificPriceRuleHasAZoneCondition(ProductSpecificPriceRuleInterface $rule, ZoneInterface $zone): void
    {
        $this->assertConditionForm(ZonesConfigurationType::class, 'zones');

        $this->addCondition($rule, $this->createConditionWithForm('zones', [
            'zones' => [
                $zone->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition currencies with (currency "[^"]+")$/
     * @Given /^the (specific price rule) has a condition currencies with (currency "[^"]+")$/
     */
    public function theProductsSpecificPriceRuleHasACurrencyCondition(ProductSpecificPriceRuleInterface $rule, CurrencyInterface $currency): void
    {
        $this->assertConditionForm(CurrenciesConfigurationType::class, 'currencies');

        $this->addCondition($rule, $this->createConditionWithForm('currencies', [
            'currencies' => [
                $currency->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a action discount-percent with ([^"]+)% discount$/
     * @Given /^the (specific price rule) has a action discount-percent with ([^"]+)% discount$/
     */
    public function theProductSpecificPriceRuleHasADiscountPercentAction(ProductSpecificPriceRuleInterface $rule, $discount): void
    {
        $this->assertActionForm(DiscountPercentConfigurationType::class, 'discountPercent');

        $this->addAction($rule, $this->createActionWithForm('discountPercent', [
            'percent' => (int) $discount,
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a action discount with ([^"]+) in (currency "[^"]+") off$/
     * @Given /^the (specific price rule) has a action discount with ([^"]+) in (currency "[^"]+") off$/
     */
    public function theProductSpecificPriceRuleHasADiscountAmountAction(ProductSpecificPriceRuleInterface $rule, $amount, CurrencyInterface $currency): void
    {
        $this->assertActionForm(DiscountAmountConfigurationType::class, 'discountAmount');

        $this->addAction($rule, $this->createActionWithForm('discountAmount', [
            'amount' => (int) $amount,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a action discount-price of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (specific price rule) has a action discount-price of ([^"]+) in (currency "[^"]+")$/
     */
    public function theProductSpecificPriceRuleHasADiscountPriceAction(ProductSpecificPriceRuleInterface $rule, $price, CurrencyInterface $currency): void
    {
        $this->assertActionForm(PriceConfigurationType::class, 'discountPrice');

        $this->addAction($rule, $this->createActionWithForm('discountPrice', [
            'price' => (int) $price,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a action price of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (specific price rule) has a action price of ([^"]+) in (currency "[^"]+")$/
     */
    public function theProductSpecificPriceRuleHasAPriceAction(ProductSpecificPriceRuleInterface $rule, $price, CurrencyInterface $currency): void
    {
        $this->assertActionForm(PriceConfigurationType::class, 'price');

        $this->addAction($rule, $this->createActionWithForm('price', [
            'price' => (int) $price,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a action not-discountable$/
     * @Given /^the (specific price rule) has a action not-discountable$/
     */
    public function theProductSpecificPriceRuleHasANotDiscountableAction(ProductSpecificPriceRuleInterface $rule): void
    {
        $this->addAction($rule, $this->createActionWithForm('notDiscountableCustomAttributes'));
    }

    /**
     * @Given /^the (specific price rule "[^"]+") has a condition nested with operator "([^"]+)" for (store "[^"]+") and (store "[^"]+")$/
     * @Given /^the (specific price rule) has a condition nested with operator "([^"]+)" for (store "[^"]+") and (store "[^"]+")$/
     */
    public function theProductsSpecificPriceRuleHasANestedConditionWithStores(ProductSpecificPriceRuleInterface $rule, $operator, StoreInterface $store1, StoreInterface $store2): void
    {
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
     * @Given /^the (specific price rule "[^"]+") has a condition nested with operator "([^"]+)" for (store "[^"]+") and (country "[^"]+")$/
     * @Given /^the (specific price rule) has a condition nested with operator "([^"]+)" for (store "[^"]+") and (country "[^"]+")$/
     */
    public function theProductsSpecificPriceRuleHasANestedConditionWithStoreAndCountry(ProductSpecificPriceRuleInterface $rule, $operator, StoreInterface $store, CountryInterface $country): void
    {
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

    private function addCondition(ProductSpecificPriceRuleInterface $rule, ConditionInterface $condition): void
    {
        $rule->addCondition($condition);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    private function addAction(ProductSpecificPriceRuleInterface $rule, ActionInterface $action): void
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
        return ProductSpecificPriceRuleConditionType::class;
    }

    protected function getActionFormRegistry(): FormTypeRegistryInterface
    {
        return $this->actionFormTypeRegistry;
    }

    protected function getActionFormClass(): string
    {
        return ProductSpecificPriceRuleActionType::class;
    }

    protected function getFormFactory(): FormFactoryInterface
    {
        return $this->formFactory;
    }
}
