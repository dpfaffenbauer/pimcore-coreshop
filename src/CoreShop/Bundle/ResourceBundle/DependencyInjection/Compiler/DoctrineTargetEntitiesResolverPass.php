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

namespace CoreShop\Bundle\ResourceBundle\DependencyInjection\Compiler;

use CoreShop\Component\Resource\Model\ResourceInterface;
use Doctrine\Common\EventSubscriber;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Exception\InvalidArgumentException;

/**
 * Resolves given target entities with container parameters.
 * Usable only with *doctrine/orm* driver.
 */
final class DoctrineTargetEntitiesResolverPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        try {
            $resources = $container->getParameter('coreshop.resources');
            $resolveTargetEntityListener = $container->findDefinition('doctrine.orm.listeners.resolve_target_entity');
        } catch (InvalidArgumentException) {
            return;
        }

        $interfaces = $this->resolve($resources);
        foreach ($interfaces as $interface => $model) {
            $resolveTargetEntityListener->addMethodCall('addResolveTargetEntity', [$interface, $model, []]);
        }

        $resolveTargetEntityListenerClass = $container->getParameterBag()->resolveValue($resolveTargetEntityListener->getClass());
        if (is_a($resolveTargetEntityListenerClass, EventSubscriber::class, true)) {
            if (!$resolveTargetEntityListener->hasTag('doctrine.event_subscriber')) {
                $resolveTargetEntityListener->addTag('doctrine.event_subscriber');
            }
        } elseif (!$resolveTargetEntityListener->hasTag('doctrine.event_listener')) {
            $resolveTargetEntityListener->addTag('doctrine.event_listener', ['event' => 'loadClassMetadata']);
        }
    }

    public function resolve(array $resources): array
    {
        $interfaces = [];

        foreach ($resources as $alias => $configuration) {
            $model = $this->getModel($alias, $configuration);

            foreach (class_implements($model) ?: [] as $interface) {
                if ($interface === ResourceInterface::class) {
                    continue;
                }

                $interfaces[$interface][] = $model;
            }
        }

        $interfaces = array_filter($interfaces, static function (array $classes): bool {
            return count($classes) === 1;
        });

        $interfaces = array_map(static function (array $classes): string {
            return current($classes);
        }, $interfaces);

        foreach ($resources as $alias => $configuration) {
            if (isset($configuration['classes']['interface'])) {
                $model = $this->getModel($alias, $configuration);
                $interface = $configuration['classes']['interface'];

                $interfaces[$interface] = $model;
            }
        }

        return $interfaces;
    }

    private function getModel(string $alias, array $configuration): string
    {
        if (!isset($configuration['classes']['model'])) {
            throw new \InvalidArgumentException(sprintf('Could not get model class from resource "%s".', $alias));
        }

        return $configuration['classes']['model'];
    }
}
