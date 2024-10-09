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

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class StackClassesPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if (!$container->hasParameter('coreshop.all.pimcore_classes') || !$container->hasParameter('coreshop.all.stack')) {
            return;
        }

        /**
         * @var array $classes
         */
        $classes = $container->getParameter('coreshop.all.pimcore_classes');

        /**
         * @var array $stack
         */
        $stack = $container->getParameter('coreshop.all.stack');

        $classStack = [];
        $classStackPimcoreClassName = [];

        foreach ($stack as $alias => $interface) {
            [$applicationName, $name] = explode('.', $alias);

            $classStack[$alias] = [];
            $classStackPimcoreClassName[$alias] = [];

            foreach ($classes as $definition) {
                if (!@interface_exists($definition['classes']['interface'])) {
                    continue;
                }

                if ($interface === $definition['classes']['interface'] || in_array($interface, class_implements($definition['classes']['interface']), true)) {
                    $classStack[$alias][] = $definition['classes']['model'];

                    if (!empty($definition['classes']['pimcore_class_name'])) {
                        $class = $definition['classes']['pimcore_class_name'];
                    } else {
                        $fullClassName = $definition['classes']['model'];
                        $class = str_replace(['Pimcore\\Model\\DataObject\\', '\\'], '', $fullClassName);
                    }

                    $classStackPimcoreClassName[$alias][] = $class;
                }
            }

            $container->setParameter(sprintf('%s.stack.%s.fqcns', $applicationName, $name), $classStack[$alias]);
            $container->setParameter(sprintf('%s.stack.%s.pimcore_class_names', $applicationName, $name), $classStackPimcoreClassName[$alias]);
        }

        $container->setParameter('coreshop.all.stack.fqcns', $classStack);
        $container->setParameter('coreshop.all.stack.pimcore_class_names', $classStackPimcoreClassName);
    }
}
