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

namespace CoreShop\Bundle\ShippingBundle\DependencyInjection;

use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use CoreShop\Bundle\ShippingBundle\Attribute\AsCarrierPriceCalculator;
use CoreShop\Bundle\ShippingBundle\Attribute\AsShippableValidator;
use CoreShop\Bundle\ShippingBundle\Attribute\AsShippingRuleActionProcessor;
use CoreShop\Bundle\ShippingBundle\Attribute\AsShippingRuleConditionChecker;
use CoreShop\Bundle\ShippingBundle\Attribute\AsShippingTaxCalculatorStrategy;
use CoreShop\Bundle\ShippingBundle\DependencyInjection\Compiler\CompositeShippableValidatorPass;
use CoreShop\Bundle\ShippingBundle\DependencyInjection\Compiler\ShippingPriceCalculatorsPass;
use CoreShop\Bundle\ShippingBundle\DependencyInjection\Compiler\ShippingRuleActionPass;
use CoreShop\Bundle\ShippingBundle\DependencyInjection\Compiler\ShippingRuleConditionPass;
use CoreShop\Bundle\ShippingBundle\DependencyInjection\Compiler\ShippingTaxCalculationStrategyPass;
use CoreShop\Component\Registry\Autoconfiguration;
use CoreShop\Component\Shipping\Calculator\CarrierPriceCalculatorInterface;
use CoreShop\Component\Shipping\Resolver\DefaultCarrierResolverInterface;
use CoreShop\Component\Shipping\Rule\Condition\ShippingConditionCheckerInterface;
use CoreShop\Component\Shipping\Rule\Processor\ShippingRuleActionProcessorInterface;
use CoreShop\Component\Shipping\Taxation\TaxCalculationStrategyInterface;
use CoreShop\Component\Shipping\Validator\ShippableCarrierValidatorInterface;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Alias;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

final class CoreShopShippingExtension extends AbstractModelExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $this->registerResources('coreshop', CoreShopResourceBundle::DRIVER_DOCTRINE_ORM, $configs['resources'], $container);

        if (array_key_exists('pimcore_admin', $configs)) {
            $this->registerPimcoreResources('coreshop', $configs['pimcore_admin'], $container);
        }

        $alias = new Alias($configs['default_resolver']);
        $alias->setPublic(true);

        $container->setAlias(DefaultCarrierResolverInterface::class, $alias);

        $bundles = $container->getParameter('kernel.bundles');

        if (array_key_exists('PimcoreDataHubBundle', $bundles)) {
            $loader->load('services/data_hub.yml');
        }

        $loader->load('services.yml');

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ShippableCarrierValidatorInterface::class,
            CompositeShippableValidatorPass::SHIPABLE_VALIDATOR_TAG,
            AsShippableValidator::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            CarrierPriceCalculatorInterface::class,
            ShippingPriceCalculatorsPass::SHIPPING_PRICE_CALCULATOR_TAG,
            AsCarrierPriceCalculator::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ShippingRuleActionProcessorInterface::class,
            ShippingRuleActionPass::SHIPPING_RULE_ACTION_TAG,
            AsShippingRuleActionProcessor::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ShippingConditionCheckerInterface::class,
            ShippingRuleConditionPass::SHIPPING_RULE_CONDITION_TAG,
            AsShippingRuleConditionChecker::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            TaxCalculationStrategyInterface::class,
            ShippingTaxCalculationStrategyPass::SHIPPING_TAX_STRATEGY_TAG,
            AsShippingTaxCalculatorStrategy::class,
            $configs['autoconfigure_with_attributes'],
        );
    }
}
