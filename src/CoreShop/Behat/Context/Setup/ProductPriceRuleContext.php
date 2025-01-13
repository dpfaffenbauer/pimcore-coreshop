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
use CoreShop\Bundle\CoreBundle\Form\Type\ProductPriceRule\Condition\QuantityConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CategoriesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CountriesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CurrenciesConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CustomerGroupsConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\CustomersConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\ProductsConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\StoresConfigurationType;
use CoreShop\Bundle\CoreBundle\Form\Type\Rule\Condition\ZonesConfigurationType;
use CoreShop\Bundle\OrderBundle\Form\Type\Rule\Condition\NotCombinableConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\ProductPriceRuleActionType;
use CoreShop\Bundle\ProductBundle\Form\Type\ProductPriceRuleConditionType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Action\DiscountAmountConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Action\DiscountPercentConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Action\PriceConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Condition\ProductPriceNestedConfigurationType;
use CoreShop\Bundle\ProductBundle\Form\Type\Rule\Condition\TimespanConfigurationType;
use CoreShop\Bundle\ResourceBundle\Form\Registry\FormTypeRegistryInterface;
use CoreShop\Bundle\RuleBundle\Form\Type\Rule\EmptyConfigurationFormType;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Address\Model\ZoneInterface;
use CoreShop\Component\Core\Model\CategoryInterface;
use CoreShop\Component\Core\Model\CountryInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Model\CustomerInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Customer\Model\CustomerGroupInterface;
use CoreShop\Component\Order\Model\CartPriceRuleInterface;
use CoreShop\Component\Product\Model\ProductPriceRuleInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Rule\Model\ActionInterface;
use CoreShop\Component\Rule\Model\ConditionInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Form\FormFactoryInterface;

final class ProductPriceRuleContext implements Context
{
    use ConditionFormTrait;
    use ActionFormTrait;

    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FormFactoryInterface $formFactory,
        private FormTypeRegistryInterface $conditionFormTypeRegistry,
        private FormTypeRegistryInterface $actionFormTypeRegistry,
        private FactoryInterface $productPriceRuleFactory,
    ) {
    }

    /**
     * @Given /^adding a product price rule named "([^"]+)"$/
     */
    public function addingAProductPriceRule($ruleName): void
    {
        /**
         * @var ProductPriceRuleInterface $rule
         */
        $rule = $this->productPriceRuleFactory->createNew();
        $rule->setName($ruleName);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();

        $this->sharedStorage->set('product-price-rule', $rule);
    }

    /**
     * @Given /^the (price rule "[^"]+") is active$/
     * @Given /^the (price rule) is active$/
     */
    public function theProductPriceRuleIsActive(ProductPriceRuleInterface $rule): void
    {
        $rule->setActive(true);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (price rule "[^"]+") is inactive$/
     * @Given /^the (price rule) is inactive$/
     */
    public function theProductPriceRuleIsInActive(ProductPriceRuleInterface $rule): void
    {
        $rule->setActive(false);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (price rule "[^"]+") is stop propagation$/
     * @Given /^the (price rule) is stop propagation$/
     */
    public function theProductPriceRuleIsStopPropagation(ProductPriceRuleInterface $rule): void
    {
        $rule->setStopPropagation(true);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (price rule "[^"]+") is not stop propagation$/
     * @Given /^the (price rule) is not stop propagation$/
     */
    public function theProductPriceRuleIsNotStopPropagation(ProductPriceRuleInterface $rule): void
    {
        $rule->setStopPropagation(false);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (price rule "[^"]+") has priority "([\d]+)"$/
     * @Given /^the (price rule) has priority "([\d]+)"$/
     */
    public function theProductPriceRuleHasPriority(ProductPriceRuleInterface $rule, int $priority): void
    {
        $rule->setPriority($priority);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition countries with (country "[^"]+")$/
     * @Given /^the (price rule) has a condition countries with (country "[^"]+")$/
     */
    public function theProductPriceRuleHasACountriesCondition(
        ProductPriceRuleInterface $rule,
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
     * @Given /^the (price rule "[^"]+") has a condition customers with (customer "[^"]+")$/
     * @Given /^the (price rule) has a condition customers with (customer "[^"]+")$/
     */
    public function theProductPriceRuleHasACustomerCondition(
        ProductPriceRuleInterface $rule,
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
     * @Given /^the (price rule "[^"]+") has a condition guest$/
     * @Given /^the (price rule) has a condition guest$/
     */
    public function theProductPriceRuleHasAGuestCondition(ProductPriceRuleInterface $rule): void
    {
        $this->assertConditionForm(EmptyConfigurationFormType::class, 'guest');

        $this->addCondition($rule, $this->createConditionWithForm('guest', []));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition timespan which is valid from "([^"]+") to "([^"]+)"$/
     * @Given /^the (price rule) has a condition timespan which is valid from "([^"]+)" to "([^"]+)"$/
     */
    public function theProductPriceRuleHasATimeSpanCondition(ProductPriceRuleInterface $rule, $from, $to): void
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
     * @Given /^the (price rule "[^"]+") has a condition customer-groups with (customer-group "[^"]+")$/
     * @Given /^the (price rule) has a condition customer-groups with (customer-group "[^"]+")$/
     */
    public function theProductPriceRuleHasACustomerGroupCondition(
        ProductPriceRuleInterface $rule,
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
     * @Given /^the (price rule "[^"]+") has a condition stores with (store "[^"]+")$/
     * @Given /^the (price rule) has a condition stores with (store "[^"]+")$/
     */
    public function theProductPriceRuleHasAStoreCondition(ProductPriceRuleInterface $rule, StoreInterface $store): void
    {
        $this->assertConditionForm(StoresConfigurationType::class, 'stores');

        $this->addCondition($rule, $this->createConditionWithForm('stores', [
            'stores' => [
                $store->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition zones with (zone "[^"]+")$/
     * @Given /^the (price rule) has a condition zones with (zone "[^"]+")$/
     */
    public function theProductPriceRuleHasAZoneCondition(ProductPriceRuleInterface $rule, ZoneInterface $zone): void
    {
        $this->assertConditionForm(ZonesConfigurationType::class, 'zones');

        $this->addCondition($rule, $this->createConditionWithForm('zones', [
            'zones' => [
                $zone->getId(),
            ],
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition currencies with (currency "[^"]+")$/
     * @Given /^the (price rule) has a condition currencies with (currency "[^"]+")$/
     */
    public function theProductPriceRuleHasACurrencyCondition(
        ProductPriceRuleInterface $rule,
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
     * @Given /^the (price rule "[^"]+") has a condition categories with (category "[^"]+")$/
     * @Given /^the (price rule) has a condition categories with (category "[^"]+")$/
     */
    public function theProductPriceRuleHasACategoriesCondition(
        ProductPriceRuleInterface $rule,
        CategoryInterface $category,
    ): void {
        $this->assertConditionForm(CategoriesConfigurationType::class, 'categories');

        $this->addCondition($rule, $this->createConditionWithForm('categories', [
            'categories' => [$category->getId()],
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition categories with (category "[^"]+") and it is recursive$/
     * @Given /^the (price rule) has a condition categories with (category "[^"]+") and it is recursive$/
     */
    public function theProductPriceRuleHasACategoriesConditionAndItIsRecursive(
        ProductPriceRuleInterface $rule,
        CategoryInterface $category,
    ): void {
        $this->assertConditionForm(CategoriesConfigurationType::class, 'categories');

        $this->addCondition($rule, $this->createConditionWithForm('categories', [
            'categories' => [$category->getId()],
            'recursive' => true,
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition products with (product "[^"]+")$/
     * @Given /^the (price rule) has a condition products with (product "[^"]+")$/
     * @Given /^the (price rule) has a condition products with (product "[^"]+") and (product "[^"]+")$/
     */
    public function theProductPriceRuleHasAProductCondition(
        ProductPriceRuleInterface $rule,
        ProductInterface $product,
        ProductInterface $product2 = null,
    ): void {
        $this->assertConditionForm(ProductsConfigurationType::class, 'products');

        $configuration = [
            'products' => [
                $product->getId(),
            ],
            'include_variants' => false,
        ];

        if (null !== $product2) {
            $configuration['products'][] = $product2->getId();
        }

        $this->addCondition($rule, $this->createConditionWithForm('products', $configuration));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition products with (product "[^"]+") which includes variants$/
     * @Given /^the (price rule) has a condition products with (product "[^"]+") which includes variants$/
     * @Given /^the (price rule) has a condition products with (product "[^"]+") and (product "[^"]+") which includes variants$/
     */
    public function theProductPriceRuleHasAProductConditionWhichIncludesVariants(
        ProductPriceRuleInterface $rule,
        ProductInterface $product,
        ProductInterface $product2 = null,
    ): void {
        $this->assertConditionForm(ProductsConfigurationType::class, 'products');

        $configuration = [
            'products' => [
                $product->getId(),
            ],
            'include_variants' => true,
        ];

        if (null !== $product2) {
            $configuration['products'][] = $product2->getId();
        }

        $this->addCondition($rule, $this->createConditionWithForm('products', $configuration));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a action discount-percent with ([^"]+)% discount$/
     * @Given /^the (price rule) has a action discount-percent with ([^"]+)% discount$/
     */
    public function theProductPriceRuleHasADiscountPercentAction(ProductPriceRuleInterface $rule, $discount): void
    {
        $this->assertActionForm(DiscountPercentConfigurationType::class, 'discountPercent');

        $this->addAction($rule, $this->createActionWithForm('discountPercent', [
            'percent' => (int) $discount,
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a action discount with ([^"]+) in (currency "[^"]+") off$/
     * @Given /^the (price rule) has a action discount with ([^"]+) in (currency "[^"]+") off$/
     */
    public function theProductPriceRuleHasADiscountAmountAction(
        ProductPriceRuleInterface $rule,
        $amount,
        CurrencyInterface $currency,
    ): void {
        $this->assertActionForm(DiscountAmountConfigurationType::class, 'discountAmount');

        $this->addAction($rule, $this->createActionWithForm('discountAmount', [
            'amount' => (int) $amount,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a action discount-price of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (price rule) has a action discount-price of ([^"]+) in (currency "[^"]+")$/
     */
    public function theProductPriceRuleHasADiscountPrice(
        ProductPriceRuleInterface $rule,
        $price,
        CurrencyInterface $currency,
    ): void {
        $this->assertActionForm(PriceConfigurationType::class, 'discountPrice');

        $this->addAction($rule, $this->createActionWithForm('discountPrice', [
            'price' => (int) $price,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a action price of ([^"]+) in (currency "[^"]+")$/
     * @Given /^the (price rule) has a action price of ([^"]+) in (currency "[^"]+")$/
     */
    public function theProductPriceRuleHasAPrice(ProductPriceRuleInterface $rule, $price, CurrencyInterface $currency): void
    {
        $this->assertActionForm(PriceConfigurationType::class, 'price');

        $this->addAction($rule, $this->createActionWithForm('price', [
            'price' => (int) $price,
            'currency' => $currency->getId(),
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a action not-discountable$/
     * @Given /^the (price rule) has a action not-discountable$/
     */
    public function theProductPriceRuleHasAActionNotDiscountable(ProductPriceRuleInterface $rule): void
    {
        $this->addAction($rule, $this->createActionWithForm('notDiscountableCustomAttributes'));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition quantity with min (\d+) and max (\d+)$/
     * @Given /^the (price rule) has a condition quantity with min (\d+) and max (\d+)$/
     */
    public function theProductPriceRuleHasAQuantityCondition(
        ProductPriceRuleInterface $rule,
        int $min,
        int $max,
    ): void {
        $this->assertConditionForm(QuantityConfigurationType::class, 'quantity');

        $configuration = [
            'minQuantity' => $min,
            'maxQuantity' => $max,
        ];

        $this->addCondition($rule, $this->createConditionWithForm('quantity', $configuration));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition nested with operator "([^"]+)" with (product "[^"]+")$/
     * @Given /^the (price rule) has a condition nested with operator "([^"]+)" with (product "[^"]+")$/
     */
    public function theProductsPriceRuleHasANestedConditionWithProduct(ProductPriceRuleInterface $rule, $operator, ProductInterface $product): void
    {
        $this->assertConditionForm(ProductPriceNestedConfigurationType::class, 'nested');

        $this->addCondition($rule, $this->createConditionWithForm('nested', [
            'operator' => $operator,
            'conditions' => [
                [
                    'type' => 'products',
                    'configuration' => [
                        'products' => [
                            $product->getId(),
                        ],
                    ],
                ],
            ],
        ]));
    }

    /**
     * @Given /^the (price rule "[^"]+") has a condition not combinable with (cart rule "[^"]+")$/
     * @Given /^the (price rule) has a condition not combinable with (cart rule "[^"]+")$/
     * @Given /^the (price rule) has a condition not combinable with (cart rule "[^"]+") and (cart rule "[^"]+")$/
     * @Given /^the (price rule "[^"]+") has a condition not combinable with (cart rule "[^"]+") and (cart rule "[^"]+")$/
     */
    public function theCartPriceRuleHasANotCombinableCondition(ProductPriceRuleInterface $rule, CartPriceRuleInterface $notCombinable, CartPriceRuleInterface $notCombinable2 = null): void
    {
        $this->assertConditionForm(NotCombinableConfigurationType::class, 'not_combinable_with_cart_price_voucher_rule');

        $configuration = [
            'price_rules' => [
                $notCombinable->getId(),
            ],
        ];

        if (null !== $notCombinable2) {
            $configuration['price_rules'][] = $notCombinable2->getId();
        }

        $this->addCondition($rule, $this->createConditionWithForm('not_combinable_with_cart_price_voucher_rule', $configuration));
    }

    private function addCondition(ProductPriceRuleInterface $rule, ConditionInterface $condition): void
    {
        $rule->addCondition($condition);

        $this->objectManager->persist($rule);
        $this->objectManager->flush();
    }

    private function addAction(ProductPriceRuleInterface $rule, ActionInterface $action): void
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
        return ProductPriceRuleConditionType::class;
    }

    protected function getActionFormRegistry(): FormTypeRegistryInterface
    {
        return $this->actionFormTypeRegistry;
    }

    protected function getActionFormClass(): string
    {
        return ProductPriceRuleActionType::class;
    }

    protected function getFormFactory(): FormFactoryInterface
    {
        return $this->formFactory;
    }
}
