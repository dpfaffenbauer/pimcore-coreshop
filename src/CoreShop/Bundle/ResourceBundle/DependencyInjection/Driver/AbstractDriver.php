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

namespace CoreShop\Bundle\ResourceBundle\DependencyInjection\Driver;

use CoreShop\Bundle\ResourceBundle\Controller\EventDispatcherInterface;
use CoreShop\Bundle\ResourceBundle\Controller\ResourceFormFactoryInterface;
use CoreShop\Bundle\ResourceBundle\Controller\ViewHandlerInterface;
use CoreShop\Bundle\ResourceBundle\Form\Helper\ErrorSerializer;
use CoreShop\Component\Resource\Factory\Factory;
use CoreShop\Component\Resource\Factory\TranslatableFactoryInterface;
use CoreShop\Component\Resource\Metadata\Metadata;
use CoreShop\Component\Resource\Metadata\MetadataInterface;
use CoreShop\Component\Resource\Metadata\RegistryInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

abstract class AbstractDriver implements DriverInterface
{
    public function load(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        $this->setClassesParameters($container, $metadata);

        if ($metadata->hasClass('admin_controller')) {
            $this->addController($container, $metadata);
        }

        $this->addManager($container, $metadata);
        $this->addRepository($container, $metadata);

        if ($metadata->hasClass('factory')) {
            $this->addFactory($container, $metadata);
        }
    }

    protected function setClassesParameters(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        if ($metadata->hasClass('model')) {
            $container->setParameter(sprintf('%s.model.%s.class', $metadata->getApplicationName(), $metadata->getName()), $metadata->getClass('model'));
        }
        if ($metadata->hasClass('interface')) {
            $container->setParameter(sprintf('%s.interface.%s', $metadata->getApplicationName(), $metadata->getName()), $metadata->getClass('interface'));
        }
        if ($metadata->hasClass('admin_controller')) {
            $container->setParameter(sprintf('%s.admin_controller.%s.class', $metadata->getApplicationName(), $metadata->getName()), $metadata->getClass('admin_controller'));
        }
        if ($metadata->hasClass('factory')) {
            $container->setParameter(sprintf('%s.factory.%s.class', $metadata->getApplicationName(), $metadata->getName()), $metadata->getClass('factory'));
        }
        if ($metadata->hasClass('repository')) {
            $container->setParameter(sprintf('%s.repository.%s.class', $metadata->getApplicationName(), $metadata->getName()), $metadata->getClass('repository'));
        }
    }

    protected function addController(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        $definition = new Definition($metadata->getClass('admin_controller'));
        $definition
            ->setPublic(true)
            ->setArguments([
                '$metadata' => $this->getMetadataDefinition($metadata),
                '$repository' => new Reference($metadata->getServiceId('repository')),
                '$factory' => new Reference($metadata->getServiceId('factory')),
                '$manager' => new Reference($metadata->getServiceId('manager')),
                '$viewHandler' => new Reference(ViewHandlerInterface::class),
                '$eventDispatcher' => new Reference(EventDispatcherInterface::class),
                '$resourceFormFactory' => new Reference(ResourceFormFactoryInterface::class),
                '$formErrorSerializer' => new Reference(ErrorSerializer::class),
                '$tokenStorage' => new Reference(TokenStorageInterface::class),
                '$parameterBag' => new Reference(ParameterBagInterface::class),
            ])
            ->addTag('controller.service_arguments')
            ->addTag('container.service_subscriber')
        ;

        $container->setDefinition($metadata->getServiceId('admin_controller'), $definition);
    }

    protected function addFactory(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        $factoryClass = $metadata->getClass('factory');
        $modelClass = $metadata->getClass('model');

        $definition = new Definition($factoryClass);
        $definition->setPublic(true);

        $definitionArgs = [$modelClass];
        if (in_array(TranslatableFactoryInterface::class, class_implements($factoryClass) ?: [])) {
            $decoratedDefinition = new Definition(Factory::class);
            $decoratedDefinition->setArguments($definitionArgs);

            $definitionArgs = [$decoratedDefinition, new Reference('coreshop.translation_locale_provider')];
        }

        $definition->setArguments($definitionArgs);

        $container->setDefinition($metadata->getServiceId('factory'), $definition);

        foreach (class_implements($factoryClass) ?: [] as $typehintClass) {
            $container->registerAliasForArgument(
                $metadata->getServiceId('factory'),
                $typehintClass,
                $metadata->getHumanizedName() . ' factory',
            );
        }
    }

    protected function getMetadataDefinition(MetadataInterface $metadata): Definition
    {
        $definition = new Definition(Metadata::class);
        $definition
            ->setFactory([new Reference(RegistryInterface::class), 'get'])
            ->setArguments([$metadata->getAlias()])
        ;

        return $definition;
    }

    abstract protected function addManager(ContainerBuilder $container, MetadataInterface $metadata): void;

    abstract protected function addRepository(ContainerBuilder $container, MetadataInterface $metadata): void;
}
