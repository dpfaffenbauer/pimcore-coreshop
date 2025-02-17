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

namespace CoreShop\Bundle\FrontendBundle\DependencyInjection;

use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

final class CoreShopFrontendExtension extends AbstractModelExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);

        if (array_key_exists('pimcore_admin', $configs)) {
            $this->registerPimcoreResources('coreshop', $configs['pimcore_admin'], $container);
        }

        if (array_key_exists('controllers', $configs)) {
            $container->setParameter('coreshop.frontend.controllers', $configs['controllers']);

            foreach ($configs['controllers'] as $key => $value) {
                $container->setParameter(sprintf('coreshop.frontend.controller.%s', $key), $value);
            }
        }

        $container->setParameter('coreshop.frontend.view_suffix', $configs['view_suffix']);

        if (isset($configs['view_prefix'])) {
            $container->setParameter('coreshop.frontend.view_prefix', $configs['view_prefix']);
        } else {
            $container->setParameter('coreshop.frontend.view_prefix', '@' . $configs['view_bundle']);
        }

        $container->setParameter('coreshop.frontend.category.valid_sort_options', $configs['category']['valid_sort_options']);
        $container->setParameter('coreshop.frontend.category.default_sort_name', $configs['category']['default_sort_name']);
        $container->setParameter('coreshop.frontend.category.default_sort_direction', $configs['category']['default_sort_direction']);

        $container->setParameter('coreshop.frontend_dir', dirname(__DIR__));

        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('services.yml');
    }
}
