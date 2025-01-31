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
use Behat\Behat\Tester\Exception\PendingException;
use Carbon\Carbon;
use CoreShop\Bundle\CoreBundle\Form\Type\Payment\Rule\Action\AdditionAmountActionConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Payment\Rule\Action\DiscountAmountActionConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Payment\Rule\Action\PriceActionConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CarriersConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CategoriesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CountriesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CurrenciesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CustomerGroupsConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CustomersConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\ProductsConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\StoresConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\ZonesConfigurationType;
use CoreShop\Bundle\PaymentBundle\Form\Type\PaymentProviderRuleActionType;
use CoreShop\Bundle\PaymentBundle\Form\Type\PaymentProviderRuleConditionType;
use CoreShop\Bundle\PaymentBundle\Form\Type\Rule\Action\AdditionPercentActionConfigurationType;
use CoreShop\Bundle\PaymentBundle\Form\Type\Rule\Action\DiscountPercentActionConfigurationType;
use CoreShop\Bundle\PaymentBundle\Form\Type\Rule\Condition\AmountConfigurationType;
use CoreShop\Bundle\ResourceBundle\Form\Registry\FormTypeRegistryInterface;
use CoreShop\Bundle\RuleBundle\Form\Type\Rule\EmptyConfigurationFormType;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Address\Model\ZoneInterface;
use CoreShop\Component\Core\Model\CarrierInterface;
use CoreShop\Component\Core\Model\CategoryInterface;
use CoreShop\Component\Core\Model\CountryInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Model\CustomerInterface;
use CoreShop\Component\Core\Model\OrderInterface;
use CoreShop\Component\Core\Model\PaymentInterface;
use CoreShop\Component\Core\Model\PaymentProviderInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Customer\Model\CustomerGroupInterface;
use CoreShop\Component\Payment\Model\PaymentProviderRuleGroupInterface;
use CoreShop\Component\Payment\Model\PaymentProviderRuleInterface;
use CoreShop\Component\PayumPayment\Model\GatewayConfig;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Rule\Model\ActionInterface;
use CoreShop\Component\Rule\Model\ConditionInterface;
use Doctrine\Persistence\ObjectManager;
use Pimcore\Tool;
use Symfony\Component\Form\FormFactoryInterface;

final class PaymentContext implements Context
{
    use ConditionFormTrait;
    use ActionFormTrait;

    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FormFactoryInterface $formFactory,
        private FormTypeRegistryInterface $conditionFormTypeRegistry,
        private FormTypeRegistryInterface $actionFormTypeRegistry,
        private FactoryInterface $paymentFactory,
        private FactoryInterface $paymentProviderFactory,
        private FactoryInterface $gatewayConfigFactory,
        private FactoryInterface $paymentProviderRuleFactory,
        private FactoryInterface $paymentProviderRuleGroupFactory,
    ) {
    }

    /**
     * @Given /^There is a payment provider "([^"]+)" using factory "([^"]+)"$/
     * @Given /^the site has a payment provider "([^"]+)" using factory "([^"]+)"$/
     */
    public function thereIsAPaymentProviderUsingFactory($name, $factory): void
    {
        /**
         * @var PaymentProviderInterface $paymentProvider
         */
        $paymentProvider = $this->paymentProviderFactory->createNew();
        /**
         * @var GatewayConfig $gatewayConfig
         */
        $gatewayConfig = $this->gatewayConfigFactory->createNew();

        foreach (Tool::getValidLanguages() as $lang) {
            $paymentProvider->setTitle($name, $lang);
        }

        $gatewayConfig->setFactoryName($factory);
        $gatewayConfig->setGatewayName($name);
        $paymentProvider->setGatewayConfig($gatewayConfig);
        $paymentProvider->setIdentifier($name);
        $paymentProvider->addStore($this->sharedStorage->get('store'));
        $paymentProvider->setActive(true);

        $this->objectManager->persist($gatewayConfig);
        $this->objectManager->persist($paymentProvider);
        $this->objectManager->flush();

        $this->sharedStorage->set('payment-provider', $paymentProvider);
    }

    /**
     * @Given /^I create a payment for (my order) with (payment provider "[^"]+") and amount ([^"]+)$/
     * @Given /^I create a payment for (my order) with (payment provider "[^"]+")$/
     */
    public function iCreateAPaymentForOrderWithProviderAndAmount(OrderInterface $order, PaymentProviderInterface $paymentProvider, $amount = null): void
    {
        /**
         * @var PaymentInterface $payment
         */
        $payment = $this->paymentFactory->createNew();
        $payment->setCurrency($order->getBaseCurrency());
        $payment->setNumber($order->getId());
        $payment->setPaymentProvider($paymentProvider);
        $payment->setTotalAmount($amount ?? $order->getPaymentTotal());
        $payment->setState(PaymentInterface::STATE_NEW);
        $payment->setDatePayment(Carbon::now());
        $payment->setOrder($order);

        $this->objectManager->persist($payment->getCurrency());
        $this->objectManager->persist($payment);
        $this->objectManager->flush();

        $this->sharedStorage->set('orderPayment', $payment);
    }

    /**
     * @Given /^There is a payment provider "([^"]*)"$/
     */
    public function thereIsAPaymentProvider($arg1)
    {
        throw new PendingException();
    }

    protected function getConditionFormRegistry(): FormTypeRegistryInterface
    {
        return $this->conditionFormTypeRegistry;
    }

    protected function getConditionFormClass(): string
    {
        return PaymentProviderRuleConditionType::class;
    }

    private function addCondition(PaymentProviderRuleInterface $rule, ConditionInterface $condition): void
    {
        $rule->addCondition($condition);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    private function addAction(PaymentProviderRuleInterface $rule, ActionInterface $action): void
    {
        $rule->addAction($action);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    protected function getActionFormRegistry(): FormTypeRegistryInterface
    {
        return $this->actionFormTypeRegistry;
    }

    protected function getActionFormClass(): string
    {
        return PaymentProviderRuleActionType::class;
    }

    protected function getFormFactory(): FormFactoryInterface
    {
        return $this->formFactory;
    }

    private function savePaymentProvider(PaymentProviderInterface $paymentProvider): void
    {
        $this->objectManager->persist($paymentProvider);
        $this->objectManager->flush();

        $this->sharedStorage->set('paymentProvider', $paymentProvider);
    }

    /**
     * @Given /^adding a payment-provider-rule named "([^"]+)"$/
     */
    public function addingAPaymentProviderRule($ruleName): void
    {
        /**
         * @var PaymentProviderRuleInterface $rule
         */
        $rule = $this->paymentProviderRuleFactory->createNew();
        $rule->setName($ruleName);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();

        $this->sharedStorage->set('payment-provider-rule', $rule);
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") is active$/
     * @Given /^the (payment-provider-rule) is active$/
     */
    public function thePaymentProviderRuleIsActive(PaymentProviderRuleInterface $rule): void
    {
        $rule->setActive(true);
        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") is inactive$/
     * @Given /^the (payment-provider-rule) is inactive$/
     */
    public function thePaymentProviderRuleIsInActive(PaymentProviderRuleInterface $rule): void
    {
        $rule->setActive(false);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") belongs to (payment provider "[^"]+")$/
     * @Given /^the (payment-provider-rule) belongs to (payment provider "[^"]+")$/
     */
    public function addingPaymentProviderRule(PaymentProviderRuleInterface $paymentProviderRule, PaymentProviderInterface $paymentProvider): void
    {
        /**
         * @var PaymentProviderRuleGroupInterface $paymentProviderRuleGroup
         */
        $paymentProviderRuleGroup = $this->paymentProviderRuleGroupFactory->createNew();
        $paymentProviderRuleGroup->setPaymentProviderRule($paymentProviderRule);
        $paymentProviderRuleGroup->setPriority(1);
        $paymentProviderRuleGroup->setPaymentProvider($paymentProvider);

        $paymentProvider->addPaymentProviderRule($paymentProviderRuleGroup);

        $this->objectManager->persist($paymentProviderRuleGroup);

        $this->savePaymentProvider($paymentProvider);
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition amount from "([^"]+)" to "([^"]+)"$/
     * @Given /^the (payment-provider-rule) has a condition amount from "([^"]+)" to "([^"]+)"$/
     */
    public function thePaymentProviderRuleHasAAmountCondition(PaymentProviderRuleInterface $rule, $minAmount, $maxAmount): void
    {
        $this->assertConditionForm(AmountConfigurationType::class, 'amount');

        $this->addCondition($rule, $this->createConditionWithForm('amount', [
            'minAmount' => $minAmount,
            'maxAmount' => $maxAmount,
            'gross' => true,
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition amount from "([^"]+)" to "([^"]+)" which is net$/
     * @Given /^the (payment-provider-rule) has a condition amount from "([^"]+)" to "([^"]+)" which is net$/
     */
    public function thePaymentProviderRuleHasAAmountConditionWhichIsNet(PaymentProviderRuleInterface $rule, $minAmount, $maxAmount): void
    {
        $this->assertConditionForm(AmountConfigurationType::class, 'amount');

        $this->addCondition($rule, $this->createConditionWithForm('amount', [
            'minAmount' => $minAmount,
            'maxAmount' => $maxAmount,
            'gross' => false,
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition amount from total "([^"]+)" to "([^"]+)"$/
     * @Given /^the (payment-provider-rule) has a condition amount from total "([^"]+)" to "([^"]+)"$/
     */
    public function thePaymentProviderRuleHasAAmountFromTotalCondition(PaymentProviderRuleInterface $rule, $minAmount, $maxAmount): void
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
     * @Given /^the (payment-provider-rule "[^"]+") has a condition amount from total "([^"]+)" to "([^"]+)" which is net$/
     * @Given /^the (payment-provider-rule) has a condition amount from total "([^"]+)" to "([^"]+)" which is net$/
     */
    public function thePaymentProviderRuleHasAAmountFromTotalConditionWhichIsNet(PaymentProviderRuleInterface $rule, $minAmount, $maxAmount): void
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
     * @Given /^the (payment-provider-rule "[^"]+") has a condition categories with (category "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition categories with (category "[^"]+")$/
     */
    public function thePaymentProviderRuleHasACategoriesCondition(PaymentProviderRuleInterface $rule, CategoryInterface $category): void
    {
        $this->assertConditionForm(CategoriesConfigurationType::class, 'categories');

        $this->addCondition($rule, $this->createConditionWithForm('categories', [
            'categories' => [$category->getId()],
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition categories with (category "[^"]+") and it is recursive$/
     * @Given /^the (payment-provider-rule) has a condition categories with (category "[^"]+") and it is recursive$/
     */
    public function thePaymentProviderRuleHasACategoriesConditionAndItIsRecursive(PaymentProviderRuleInterface $rule, CategoryInterface $category): void
    {
        $this->assertConditionForm(CategoriesConfigurationType::class, 'categories');

        $this->addCondition($rule, $this->createConditionWithForm('categories', [
            'categories' => [$category->getId()],
            'recursive' => true,
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition categories with (categories "[^"]+", "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition categories with (categories "[^"]+", "[^"]+")$/
     */
    public function thePaymentProviderRuleHasACategoriesConditionWithTwoCategories(PaymentProviderRuleInterface $rule, array $categories): void
    {
        $this->assertConditionForm(CategoriesConfigurationType::class, 'categories');

        $this->addCondition($rule, $this->createConditionWithForm('categories', [
            'categories' => array_map(function ($category) {
                return $category->getId();
            }, $categories),
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition products with (product "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition products with (product "[^"]+")$/
     */
    public function thepaymentProviderRuleHasAProductsCondition(PaymentProviderRuleInterface $rule, ProductInterface $product): void
    {
        $this->assertConditionForm(ProductsConfigurationType::class, 'products');

        $this->addCondition($rule, $this->createConditionWithForm('products', [
            'products' => [$product->getId()],
            'include_variants' => false,
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition products with (product "[^"]+") which includes variants$/
     * @Given /^the (payment-provider-rule) has a condition products with (product "[^"]+") which includes variants$/
     */
    public function thePaymentProviderRuleHasAProductsWithVariantsCondition(PaymentProviderRuleInterface $rule, ProductInterface $product): void
    {
        $this->assertConditionForm(ProductsConfigurationType::class, 'products');

        $this->addCondition($rule, $this->createConditionWithForm('products', [
            'products' => [$product->getId()],
            'include_variants' => true,
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition products with (products "[^"]+", "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition products with (products "[^"]+", "[^"]+")$/
     */
    public function thePaymentProviderRuleHasAProductsConditionWithTwoProducts(PaymentProviderRuleInterface $rule, array $products): void
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
     * @Given /^the (payment-provider-rule "[^"]+") has a condition products with (products "[^"]+", "[^"]+") which includes variants$/
     * @Given /^the (payment-provider-rule) has a condition products with (products "[^"]+", "[^"]+") which includes variants$/
     */
    public function thePaymentProviderRuleHasAProductsConditionWithTwoProductsWithVariants(PaymentProviderRuleInterface $rule, array $products): void
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
     * @Given /^the (payment-provider-rule "[^"]+") has a condition countries with (country "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition countries with (country "[^"]+")$/
     */
    public function thePaymentProviderRuleHasACountriesCondition(PaymentProviderRuleInterface $rule, CountryInterface $country): void
    {
        $this->assertConditionForm(CountriesConfigurationType::class, 'countries');

        $this->addCondition($rule, $this->createConditionWithForm('countries', [
            'countries' => [$country->getId()],
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition customers with (customer "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition customers with (customer "[^"]+")$/
     */
    public function thePaymentProviderRuleHasACustomersCondition(PaymentProviderRuleInterface $rule, CustomerInterface $customer): void
    {
        $this->assertConditionForm(CustomersConfigurationType::class, 'customers');

        $this->addCondition($rule, $this->createConditionWithForm('customers', [
            'customers' => [$customer->getId()],
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition customer-groups with (customer-group "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition customer-groups with (customer-group "[^"]+")$/
     */
    public function thePaymentProviderRuleHasACustomerGroupsCondition(PaymentProviderRuleInterface $rule, CustomerGroupInterface $customerGroup): void
    {
        $this->assertConditionForm(CustomerGroupsConfigurationType::class, 'customerGroups');

        $this->addCondition($rule, $this->createConditionWithForm('customerGroups', [
            'customerGroups' => [$customerGroup->getId()],
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition guest$/
     * @Given /^the (payment-provider-rule) has a condition guest$/
     */
    public function thePaymentProviderRuleHasAGuestCondition(PaymentProviderRuleInterface $rule): void
    {
        $this->assertConditionForm(EmptyConfigurationFormType::class, 'guest');

        $this->addCondition($rule, $this->createConditionWithForm('guest', []));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition zones with (zone "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition zones with (zone "[^"]+")$/
     */
    public function thePaymentProviderRuleHasAZonesCondition(PaymentProviderRuleInterface $rule, ZoneInterface $zone): void
    {
        $this->assertConditionForm(ZonesConfigurationType::class, 'zones');

        $this->addCondition($rule, $this->createConditionWithForm('zones', [
            'zones' => [$zone->getId()],
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition stores with (store "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition stores with (store "[^"]+")$/
     */
    public function thePaymentProviderRuleHasAStoresCondition(PaymentProviderRuleInterface $rule, StoreInterface $store): void
    {
        $this->assertConditionForm(StoresConfigurationType::class, 'stores');

        $this->addCondition($rule, $this->createConditionWithForm('stores', [
            'stores' => [$store->getId()],
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition currencies with (currency "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition currencies with (currency "[^"]+")$/
     */
    public function thePaymentProviderRuleHasACurrenciesCondition(PaymentProviderRuleInterface $rule, CurrencyInterface $currency): void
    {
        $this->assertConditionForm(CurrenciesConfigurationType::class, 'currencies');

        $this->addCondition($rule, $this->createConditionWithForm('currencies', [
            'currencies' => [$currency->getId()],
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a action price of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a action price of ([^"]+) in (currency "[^"]+")$/
     */
    public function thePaymentProviderRuleHasAPriceAction(PaymentProviderRuleInterface $rule, $price, CurrencyInterface $currency): void
    {
        $this->assertActionForm(PriceActionConfigurationType::class, 'price');
        $this->addAction($rule, $this->createActionWithForm('price', [
            'price' => (int) $price,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a condition carriers with (carrier "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a condition carriers with (carrier "[^"]+")$/
     */
    public function thePaymentProviderRuleHasACarriersCondition(PaymentProviderRuleInterface $rule, CarrierInterface $carrier): void
    {
        $this->assertConditionForm(CarriersConfigurationType::class, 'carriers');

        $this->addCondition($rule, $this->createConditionWithForm('carriers', [
            'carriers' => [$carrier->getId()],
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a action additional-amount of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a action additional-amount of ([^"]+) in (currency "[^"]+")$/
     */
    public function thePaymentProviderRuleHasAAdditionalAmountAction(PaymentProviderRuleInterface $rule, $amount, CurrencyInterface $currency): void
    {
        $this->assertActionForm(AdditionAmountActionConfigurationType::class, 'additionAmount');

        $this->addAction($rule, $this->createActionWithForm('additionAmount', [
            'amount' => (int) $amount,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a action additional-percent of ([^"]+)%$/
     * @Given /^the (payment-provider-rule) has a action additional-percent of ([^"]+)%$/
     */
    public function thePaymentProviderRuleHasAAdditionalPercentAction(PaymentProviderRuleInterface $rule, $amount): void
    {
        $this->assertActionForm(AdditionPercentActionConfigurationType::class, 'additionPercent');

        $this->addAction($rule, $this->createActionWithForm('additionPercent', [
            'percent' => (int) $amount,
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a action discount-amount of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (payment-provider-rule) has a action discount-amount of ([^"]+) in (currency "[^"]+")$/
     */
    public function thePaymentProviderRuleHasADiscountAmountAction(PaymentProviderRuleInterface $rule, $amount, CurrencyInterface $currency): void
    {
        $this->assertActionForm(DiscountAmountActionConfigurationType::class, 'discountAmount');

        $this->addAction($rule, $this->createActionWithForm('discountAmount', [
            'amount' => (int) $amount,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (payment-provider-rule "[^"]+") has a action discount-percent of ([^"]+)%$/
     * @Given /^the (payment-provider-rule) has a action discount-percent of ([^"]+)%$/
     */
    public function thePaymentProviderRuleHasADiscountPercentAction(PaymentProviderRuleInterface $rule, $amount): void
    {
        $this->assertActionForm(DiscountPercentActionConfigurationType::class, 'discountPercent');

        $this->addAction($rule, $this->createActionWithForm('discountPercent', [
            'percent' => (int) $amount,
        ]));
    }
}
