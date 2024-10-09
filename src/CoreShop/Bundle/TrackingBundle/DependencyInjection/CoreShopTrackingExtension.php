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

namespace CoreShop\Bundle\TrackingBundle\DependencyInjection;

use CoreShop\Bundle\TrackingBundle\Attribute\AsTracker;
use CoreShop\Bundle\TrackingBundle\Attribute\AsTrackingExtractor;
use CoreShop\Bundle\TrackingBundle\DependencyInjection\Compiler\TrackerPass;
use CoreShop\Bundle\TrackingBundle\DependencyInjection\Compiler\TrackingExtractorPass;
use CoreShop\Component\Registry\Autoconfiguration;
use CoreShop\Component\Tracking\Extractor\TrackingExtractorInterface;
use CoreShop\Component\Tracking\Tracker\TrackerInterface;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

final class CoreShopTrackingExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);

        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('services.yml');

        $this->configureTrackers($configs, $container);

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            TrackerInterface::class,
            TrackerPass::TRACKER_TAG,
            AsTracker::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            TrackingExtractorInterface::class,
            TrackingExtractorPass::TRACKING_EXTRACTOR_TAG,
            AsTrackingExtractor::class,
            $configs['autoconfigure_with_attributes'],
        );
    }

    protected function configureTrackers(array $configs, ContainerBuilder $container): void
    {
        foreach ($container->findTaggedServiceIds(TrackerPass::TRACKER_TAG) as $id => $attributes) {
            foreach ($attributes as $tag) {
                $definition = $container->findDefinition($id);

                $type = $tag['type'] ?? Container::underscore(substr(strrchr($definition->getClass(), '\\'), 1));

                if (!array_key_exists($type, $configs['trackers'])) {
                    $container->getDefinition($id)
                        ->addMethodCall('setEnabled', [false])
                    ;
                } else {
                    $container->getDefinition($id)
                        ->addMethodCall('setEnabled', [$configs['trackers'][$type]['enabled']])
                    ;
                }
            }
        }
    }
}
