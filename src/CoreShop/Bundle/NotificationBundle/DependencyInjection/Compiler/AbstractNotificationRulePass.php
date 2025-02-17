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

namespace CoreShop\Bundle\NotificationBundle\DependencyInjection\Compiler;

use CoreShop\Bundle\ResourceBundle\Form\Registry\FormTypeRegistry;
use CoreShop\Component\Registry\RegisterRegistryTypePass;
use CoreShop\Component\Registry\ServiceRegistry;
use CoreShop\Component\Rule\Condition\ConditionCheckerInterface;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;

abstract class AbstractNotificationRulePass extends RegisterRegistryTypePass
{
    public function __construct(
        $registry,
        $formRegistry,
        $parameter,
        $tag,
        protected $type,
    ) {
        parent::__construct($registry, $formRegistry, $parameter, $tag);
    }

    public function process(ContainerBuilder $container): void
    {
        if (!$container->has($this->registry) || !$container->has($this->formRegistry)) {
            return;
        }

        $registries = [];
        $formRegistries = [];
        $types = [];
        $registeredTypes = [];

        $registry = $container->getDefinition($this->registry);
        $formRegistry = $container->getDefinition($this->formRegistry);

        $map = [];
        foreach ($container->findTaggedServiceIds($this->tag) as $id => $attributes) {
            foreach ($attributes as $tag) {
                $definition = $container->findDefinition($id);

                if (!isset($tag['type'])) {
                    $tag['type'] = Container::underscore(substr((string) strrchr($definition->getClass(), '\\'), 1));
                }

                if (!isset($tag['notification-type'])) {
                    throw new \InvalidArgumentException('Tagged Condition `' . $id . '` needs to have `notification-type`` attribute.');
                }

                $type = $tag['notification-type'];

                if (!array_key_exists($type, $registries)) {
                    $registries[$type] = new Definition(
                        ServiceRegistry::class,
                        [ConditionCheckerInterface::class, 'notification-rule-' . $this->type . '-' . $type],
                    );

                    $formRegistries[$type] = new Definition(
                        FormTypeRegistry::class,
                    );

                    $types[] = $type;

                    $container->setDefinition($this->registry . '.' . $type, $registries[$type]);
                    $container->setDefinition($this->formRegistry . '.' . $type, $formRegistries[$type]);
                }

                $map[$tag['notification-type']][$tag['type']] = $tag['type'];

                $fqtn = sprintf('%s.%s', $type, $tag['type']);

                $registries[$type]->addMethodCall('register', [$tag['type'], new Reference($id)]);
                $registry->addMethodCall('register', [$fqtn, new Reference($id)]);

                if (isset($tag['form-type'])) {
                    $formRegistries[$type]->addMethodCall('add', [$tag['type'], 'default', $tag['form-type']]);
                    $formRegistry->addMethodCall('add', [$fqtn, 'default', $tag['form-type']]);
                }

                $registeredTypes[$fqtn] = $fqtn;
            }
        }

        foreach ($map as $type => $realMap) {
            $container->setParameter($this->parameter . '.' . $type, $realMap);
        }

        $container->setParameter($this->parameter . '.types', $types);
        $container->setParameter($this->parameter, $registeredTypes);
    }
}
