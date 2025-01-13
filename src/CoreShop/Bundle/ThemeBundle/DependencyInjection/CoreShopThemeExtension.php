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

namespace CoreShop\Bundle\ThemeBundle\DependencyInjection;

use CoreShop\Bundle\ThemeBundle\Attribute\AsThemeResolver;
use CoreShop\Bundle\ThemeBundle\DependencyInjection\Compiler\CompositeThemeResolverPass;
use CoreShop\Bundle\ThemeBundle\Service\PimcoreDocumentPropertyResolver;
use CoreShop\Bundle\ThemeBundle\Service\PimcoreSiteThemeResolver;
use CoreShop\Bundle\ThemeBundle\Service\ThemeResolverInterface;
use CoreShop\Component\Registry\Autoconfiguration;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

class CoreShopThemeExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('services.yml');

        if (false === $configs['default_resolvers']['pimcore_site']) {
            $container->removeDefinition(PimcoreSiteThemeResolver::class);
        }

        if (false === $configs['default_resolvers']['pimcore_document_property']) {
            $container->removeDefinition(PimcoreDocumentPropertyResolver::class);
        }

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            ThemeResolverInterface::class,
            CompositeThemeResolverPass::THEME_RESOLVER_TAG,
            AsThemeResolver::class,
            $configs['autoconfigure_with_attributes'],
        );
    }
}
