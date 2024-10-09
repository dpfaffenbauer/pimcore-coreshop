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

namespace CoreShop\Bundle\ProductBundle\DependencyInjection;

use CoreShop\Bundle\ProductBundle\Attribute\AsProductCustomAttributeCalculator;
use CoreShop\Bundle\ProductBundle\Attribute\AsProductDiscountCalculator;
use CoreShop\Bundle\ProductBundle\Attribute\AsProductDiscountPriceCalculator;
use CoreShop\Bundle\ProductBundle\Attribute\AsProductPriceCalculator;
use CoreShop\Bundle\ProductBundle\Attribute\AsProductPriceRuleActionProcessor;
use CoreShop\Bundle\ProductBundle\Attribute\AsProductPriceRuleConditionChecker;
use CoreShop\Bundle\ProductBundle\Attribute\AsProductRetailPriceCalculator;
use CoreShop\Bundle\ProductBundle\Attribute\AsProductSpecificPriceRuleActionProcessor;
use CoreShop\Bundle\ProductBundle\Attribute\AsProductSpecificPriceRuleConditionChecker;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductCustomAttributesCalculatorsPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductDiscountCalculatorsPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductDiscountPriceCalculatorsPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductPriceRuleActionPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductPriceRuleConditionPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductRetailPriceCalculatorsPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductSpecificPriceRuleActionPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductSpecificPriceRuleConditionPass;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use CoreShop\Component\Product\Calculator\ProductCustomAttributesCalculatorInterface;
use CoreShop\Component\Product\Calculator\ProductDiscountCalculatorInterface;
use CoreShop\Component\Product\Calculator\ProductDiscountPriceCalculatorInterface;
use CoreShop\Component\Product\Calculator\ProductPriceCalculatorInterface;
use CoreShop\Component\Product\Calculator\ProductRetailPriceCalculatorInterface;
use CoreShop\Component\Product\Rule\Action\ProductActionProcessorInterface;
use CoreShop\Component\Product\Rule\Action\ProductSpecificActionProcessorInterface;
use CoreShop\Component\Product\Rule\Condition\ProductConditionCheckerInterface;
use CoreShop\Component\Product\Rule\Condition\ProductSpecificConditionCheckerInterface;
use CoreShop\Component\Registry\Autoconfiguration;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

final class CoreShopProductExtension extends AbstractModelExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $this->registerResources('coreshop', CoreShopResourceBundle::DRIVER_DOCTRINE_ORM, $configs['resources'], $container);
        $this->registerPimcoreModels('coreshop', $configs['pimcore'], $container);

        if (array_key_exists('pimcore_admin', $configs)) {
            $this->registerPimcoreResources('coreshop', $configs['pimcore_admin'], $container);
        }

        if (array_key_exists('stack', $configs)) {
            $this->registerStack('coreshop', $configs['stack'], $container);
        }

        $bundles = $container->getParameter('kernel.bundles');

        if (array_key_exists('PimcoreDataHubBundle', $bundles)) {
            $loader->load('services/data_hub.yml');
        }

        $loader->load('services.yml');


        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductDiscountCalculatorInterface::class,
            ProductDiscountCalculatorsPass::PRODUCT_DISCOUNT_CALCULATOR_TAG,
            AsProductDiscountCalculator::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductDiscountPriceCalculatorInterface::class,
            ProductDiscountPriceCalculatorsPass::PRODUCT_DISCOUNT_PRICE_CALCULATOR_TAG,
            AsProductDiscountPriceCalculator::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductPriceCalculatorInterface::class,
            ProductRetailPriceCalculatorsPass::PRODUCT_RETAIL_PRICE_CALCULATOR_TAG,
            AsProductPriceCalculator::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductRetailPriceCalculatorInterface::class,
            ProductRetailPriceCalculatorsPass::PRODUCT_RETAIL_PRICE_CALCULATOR_TAG,
            AsProductRetailPriceCalculator::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductCustomAttributesCalculatorInterface::class,
            ProductCustomAttributesCalculatorsPass::PRODUCT_CUSTOM_ATTRIBUTES_CALCULATOR_TAG,
            AsProductCustomAttributeCalculator::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductActionProcessorInterface::class,
            ProductPriceRuleActionPass::PRODUCT_PRICE_RULE_ACTION_TAG,
            AsProductPriceRuleActionProcessor::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductConditionCheckerInterface::class,
            ProductPriceRuleConditionPass::PRODUCT_PRICE_RULE_CONDITION_TAG,
            AsProductPriceRuleConditionChecker::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductSpecificActionProcessorInterface::class,
            ProductSpecificPriceRuleActionPass::PRODUCT_SPECIFIC_PRICE_RULE_ACTION_TAG,
            AsProductSpecificPriceRuleActionProcessor::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ProductSpecificConditionCheckerInterface::class,
            ProductSpecificPriceRuleConditionPass::PRODUCT_SPECIFIC_PRICE_RULE_CONDITION_TAG,
            AsProductSpecificPriceRuleConditionChecker::class,
            $configs['autoconfigure_with_attributes'],
        );
    }
}
