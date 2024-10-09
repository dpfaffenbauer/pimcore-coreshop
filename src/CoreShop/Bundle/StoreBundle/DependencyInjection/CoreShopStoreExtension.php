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

namespace CoreShop\Bundle\StoreBundle\DependencyInjection;

use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use CoreShop\Bundle\StoreBundle\Attribute\AsRequestBasedResolverStoreContext;
use CoreShop\Bundle\StoreBundle\Attribute\AsStoreContext;
use CoreShop\Bundle\StoreBundle\Collector\StoreCollector;
use CoreShop\Bundle\StoreBundle\DependencyInjection\Compiler\CompositeRequestResolverPass;
use CoreShop\Bundle\StoreBundle\DependencyInjection\Compiler\CompositeStoreContextPass;
use CoreShop\Component\Registry\Autoconfiguration;
use CoreShop\Component\Store\Context\RequestBased\RequestResolverInterface;
use CoreShop\Component\Store\Context\StoreContextInterface;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

final class CoreShopStoreExtension extends AbstractModelExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $this->registerResources('coreshop', CoreShopResourceBundle::DRIVER_DOCTRINE_ORM, $configs['resources'], $container);

        if (array_key_exists('pimcore_admin', $configs)) {
            $this->registerPimcoreResources('coreshop', $configs['pimcore_admin'], $container);
        }

        $bundles = $container->getParameter('kernel.bundles');

        if (array_key_exists('PimcoreDataHubBundle', $bundles)) {
            $loader->load('services/data_hub.yml');
        }

        $loader->load('services.yml');

        if ($configs['debug'] ?? $container->getParameter('kernel.debug')) {
            $loader->load('services/debug.yml');

            $container->getDefinition(StoreCollector::class)->replaceArgument(3, true);
        }

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            StoreContextInterface::class,
            CompositeStoreContextPass::STORE_CONTEXT_TAG,
            AsStoreContext::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            RequestResolverInterface::class,
            CompositeRequestResolverPass::STORE_REQUEST_RESOLVER_TAG,
            AsRequestBasedResolverStoreContext::class,
            $configs['autoconfigure_with_attributes'],
        );
    }
}
