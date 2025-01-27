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

namespace CoreShop\Bundle\PimcoreBundle\DependencyInjection\Compiler;

use CoreShop\Component\Registry\PrioritizedServiceRegistryInterface;
use CoreShop\Component\Registry\ServiceRegistry;
use CoreShop\Component\Registry\ServiceRegistryInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class RegisterTypeHintRegistriesPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        foreach ($container->findTaggedServiceIds('coreshop.registry') as $id => $attributes) {
            foreach ($attributes as $tag) {
                if (!isset($tag['type_hint'])) {
                    throw new \InvalidArgumentException('Tagged Repository `' . $id . '` needs to have `type_hint` attributes');
                }

                $definition = $container->findDefinition($id);

                $implements = class_implements($definition->getClass()) ?: [];

                if (
                    !in_array(ServiceRegistryInterface::class, $implements) &&
                    !in_array(PrioritizedServiceRegistryInterface::class, $implements)
                ) {
                    throw new \InvalidArgumentException(
                        sprintf(
                            'Registry needs to implement interface %s or %s, given %s',
                            ServiceRegistryInterface::class,
                            PrioritizedServiceRegistryInterface::class,
                            implode(', ', $implements),
                        ),
                    );
                }

                $container->registerAliasForArgument(
                    $id,
                    ServiceRegistryInterface::class,
                    strtolower(trim(preg_replace(
                        ['/([A-Z])/', '/[_\s]+/'],
                        ['_$1', ' '],
                        $tag['type_hint'],
                    ))) . 'Registry',
                );

                $container->registerAliasForArgument(
                    $id,
                    ServiceRegistry::class,
                    strtolower(trim(preg_replace(
                        ['/([A-Z])/', '/[_\s]+/'],
                        ['_$1', ' '],
                        $tag['type_hint'],
                    ))) . 'Registry',
                );
            }
        }
    }
}
