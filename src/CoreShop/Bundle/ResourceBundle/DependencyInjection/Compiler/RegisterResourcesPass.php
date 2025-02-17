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

use CoreShop\Component\Resource\Metadata\RegistryInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Exception\InvalidArgumentException;

final class RegisterResourcesPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        try {
            /**
             * @var array $resources
             */
            $resources = $container->getParameter('coreshop.resources');
            $registry = $container->findDefinition(RegistryInterface::class);
        } catch (InvalidArgumentException) {
            return;
        }

        foreach ($resources as $alias => $configuration) {
            $this->validateCoreShopModel($configuration['classes']['model']);
            $registry->addMethodCall('addFromAliasAndConfiguration', [$alias, $configuration]);
        }
    }

    private function validateCoreShopModel(string $class): void
    {
        if (!in_array(ResourceInterface::class, class_implements($class) ?: [], true)) {
            throw new InvalidArgumentException(sprintf(
                'Class "%s" must implement "%s" to be registered as a Resource model.',
                $class,
                ResourceInterface::class,
            ));
        }
    }
}
