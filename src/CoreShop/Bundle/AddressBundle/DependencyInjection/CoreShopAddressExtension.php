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

namespace CoreShop\Bundle\AddressBundle\DependencyInjection;

use CoreShop\Bundle\AddressBundle\Attribute\AsCountryContext;
use CoreShop\Bundle\AddressBundle\Attribute\AsRequestBasedResolverCountryContext;
use CoreShop\Bundle\AddressBundle\DependencyInjection\Compiler\CompositeCountryContextPass;
use CoreShop\Bundle\AddressBundle\DependencyInjection\Compiler\CompositeRequestResolverPass;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use CoreShop\Component\Address\Context\CountryContextInterface;
use CoreShop\Component\Address\Context\RequestBased\RequestResolverInterface;
use CoreShop\Component\Registry\Autoconfiguration;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

final class CoreShopAddressExtension extends AbstractModelExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $this->registerResources(
            'coreshop',
            CoreShopResourceBundle::DRIVER_DOCTRINE_ORM,
            $configs['resources'],
            $container,
        );
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
            CountryContextInterface::class,
            CompositeCountryContextPass::COUNTRY_CONTEXT_SERVICE_TAG,
            AsCountryContext::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            RequestResolverInterface::class,
            CompositeRequestResolverPass::COUNTRY_REQUEST_RESOLVER_SERVICE_TAG,
            AsRequestBasedResolverCountryContext::class,
            $configs['autoconfigure_with_attributes'],
        );
    }
}
