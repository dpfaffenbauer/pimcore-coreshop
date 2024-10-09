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

namespace CoreShop\Bundle\CoreBundle\DependencyInjection;

use CoreShop\Bundle\CoreBundle\Attribute\AsPortlet;
use CoreShop\Bundle\CoreBundle\Attribute\AsReport;
use CoreShop\Bundle\CoreBundle\DependencyInjection\Compiler\RegisterPortletsPass;
use CoreShop\Bundle\CoreBundle\DependencyInjection\Compiler\RegisterReportsPass;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use CoreShop\Component\Core\Portlet\PortletInterface;
use CoreShop\Component\Core\Report\ReportInterface;
use CoreShop\Component\Order\Checkout\CheckoutManagerFactoryInterface;
use CoreShop\Component\Order\Checkout\DefaultCheckoutManagerFactory;
use CoreShop\Component\Registry\Autoconfiguration;
use Pimcore\Bundle\CustomReportsBundle\PimcoreCustomReportsBundle;
use Pimcore\Bundle\SimpleBackendSearchBundle\PimcoreSimpleBackendSearchBundle;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Alias;
use Symfony\Component\DependencyInjection\ChildDefinition;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\DependencyInjection\ServiceLocator;

final class CoreShopCoreExtension extends AbstractModelExtension implements PrependExtensionInterface
{
    private static array $bundlesWithAttributeConfiguration = [
        'core_shop_address',
        'core_shop_currency',
        'core_shop_customer',
        'core_shop_index',
        'core_shop_locale',
        'core_shop_menu',
        'core_shop_payment',
        'core_shop_pimcore',
        'core_shop_product',
        'core_shop_product_quantity_price_rules',
        'core_shop_rule',
        'core_shop_seo',
        'core_shop_shipping',
        'core_shop_store',
        'core_shop_theme',
        'core_shop_tracking',
    ];

    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $container->setParameter('coreshop.all.dependant.bundles', []);

        $this->registerResources('coreshop', CoreShopResourceBundle::DRIVER_DOCTRINE_ORM, $configs['resources'], $container);
        $this->registerDependantBundles('coreshop', [PimcoreSimpleBackendSearchBundle::class, PimcoreCustomReportsBundle::class], $container);

        if (array_key_exists('pimcore_admin', $configs)) {
            $this->registerPimcoreResources('coreshop', $configs['pimcore_admin'], $container);
        }

        $container->setParameter('coreshop.after_logout_redirect_route', $configs['after_logout_redirect_route']);

        $bundles = $container->getParameter('kernel.bundles');

        if (array_key_exists('PimcoreDataHubBundle', $bundles)) {
            $loader->load('services/data_hub.yml');
        }

        $loader->load('services.yml');

        $env = (string) $container->getParameter('kernel.environment');
        if (str_contains($env, 'test')) {
            $loader->load('services_test.yml');
        }

        if (array_key_exists('checkout', $configs)) {
            $this->registerCheckout($container, $configs['checkout']);
        }

        if (array_key_exists('checkout_manager_factory', $configs)) {
            $alias = new Alias(sprintf('coreshop.checkout_manager.factory.%s', $configs['checkout_manager_factory']));
            $alias->setPublic(true);

            $container->setAlias('coreshop.checkout_manager.factory', $alias);
            $container->setAlias(CheckoutManagerFactoryInterface::class, $alias);
        } else {
            throw new \InvalidArgumentException('No valid Checkout Manager has been configured!');
        }

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            PortletInterface::class,
            RegisterPortletsPass::PORTLET_TAG,
            AsPortlet::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ReportInterface::class,
            RegisterReportsPass::REPORT_TAG,
            AsReport::class,
            $configs['autoconfigure_with_attributes'],
        );
    }

    public function prepend(ContainerBuilder $container): void
    {
        $config = $container->getExtensionConfig($this->getAlias());
        $config = $this->processConfiguration($this->getConfiguration([], $container), $config);

        foreach ($container->getExtensions() as $name => $extension) {
            if (in_array($name, self::$bundlesWithAttributeConfiguration, true)) {
                $container->prependExtensionConfig($name, [
                    'autoconfigure_with_attributes' => $config['autoconfigure_with_attributes'] ?? false,
                ]);
            }
        }
    }

    private function registerCheckout(ContainerBuilder $container, array $configs): void
    {
        $availableCheckoutManagerFactories = [];

        foreach ($configs as $checkoutIdentifier => $typeConfiguration) {
            $stepsLocatorId = sprintf('coreshop.checkout_manager.steps.%s', $checkoutIdentifier);
            $checkoutManagerFactoryId = sprintf('coreshop.checkout_manager.factory.%s', $checkoutIdentifier);

            $services = [];
            $priorityMap = [];

            foreach ($typeConfiguration['steps'] as $identifier => $step) {
                $services[$identifier] = new Reference($step['step']);
                $priorityMap[$identifier] = $step['priority'];
            }

            $stepsLocator = new Definition(ServiceLocator::class, [$services]);
            $stepsLocator->addTag('container.service_locator');
            $container->setDefinition($stepsLocatorId, $stepsLocator);

            $checkoutManagerFactory = new Definition(DefaultCheckoutManagerFactory::class, [
                new Reference($stepsLocatorId),
                $priorityMap,
            ]);

            $container->setDefinition($checkoutManagerFactoryId, $checkoutManagerFactory);

            $availableCheckoutManagerFactories[] = $checkoutManagerFactoryId;
        }

        $container->setParameter('coreshop.checkout_managers', $availableCheckoutManagerFactories);
    }
}
