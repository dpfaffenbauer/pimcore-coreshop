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

namespace CoreShop\Component\Registry;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

abstract class RegisterRegistryTypePass implements CompilerPassInterface
{
    public function __construct(
        protected string $registry,
        protected string $formRegistry,
        protected string $parameter,
        protected string $tag,
    ) {
    }

    public function process(ContainerBuilder $container): void
    {
        if (!$container->has($this->registry) || !$container->has($this->formRegistry)) {
            return;
        }

        $registry = $container->getDefinition($this->registry);
        $formRegistry = $container->getDefinition($this->formRegistry);

        $map = [];
        foreach ($container->findTaggedServiceIds($this->tag) as $id => $attributes) {
            foreach ($attributes as $tag) {
                $definition = $container->findDefinition($id);

                if (!isset($tag['type'])) {
                    $tag['type'] = Container::underscore(substr((string)strrchr($definition->getClass(), '\\'), 1));
                }

                $map[$tag['type']] = $tag['type'];

                $registry->addMethodCall('register', [$tag['type'], new Reference($id)]);

                if (isset($tag['form-type'])) {
                    $formRegistry
                        ->addMethodCall('add', [$tag['type'], 'default', $tag['form-type']])
                    ;
                }
            }
        }

        $container->setParameter($this->parameter, $map);
    }
}
