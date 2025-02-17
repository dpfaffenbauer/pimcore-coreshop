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

namespace CoreShop\Bundle\ResourceBundle\DependencyInjection\Driver\Doctrine;

use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\Doctrine\ORM\EntityRepository;
use CoreShop\Component\Resource\Factory\RepositoryFactory;
use CoreShop\Component\Resource\Metadata\MetadataInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;

final class DoctrineORMDriver extends AbstractDoctrineDriver
{
    public function getType(): string
    {
        return CoreShopResourceBundle::DRIVER_DOCTRINE_ORM;
    }

    public function load(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        parent::load($container, $metadata);

        $this->addRepositoryFactory($container, $metadata);
    }

    protected function addRepository(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        $repositoryClassParameterName = sprintf('%s.repository.%s.class', $metadata->getApplicationName(), $metadata->getName());
        $repositoryClass = EntityRepository::class;

        if ($container->hasParameter($repositoryClassParameterName)) {
            /** @var string $repositoryClass */
            $repositoryClass = $container->getParameter($repositoryClassParameterName);
        }

        if ($metadata->hasClass('repository')) {
            /** @var string $repositoryClass */
            $repositoryClass = $metadata->getClass('repository');
        }

        $definition = new Definition($repositoryClass);
        $definition->setPublic(true);
        $definition->setArguments([
            new Reference($metadata->getServiceId('manager')),
            $this->getClassMetadataDefinition($metadata),
        ]);

        $container->setDefinition($metadata->getServiceId('repository'), $definition);

        foreach (class_implements($repositoryClass) ?: [] as $typehintClass) {
            $container->registerAliasForArgument(
                $metadata->getServiceId('repository'),
                $typehintClass,
                $metadata->getHumanizedName() . ' repository',
            );
        }
    }

    protected function addRepositoryFactory(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        $repositoryFactoryClassParameterName = sprintf('%s.repository.factory.%s.class', $metadata->getApplicationName(), $metadata->getName());
        $repositoryFactoryClass = RepositoryFactory::class;
        $repositoryClass = EntityRepository::class;

        if ($container->hasParameter($repositoryFactoryClassParameterName)) {
            /** @var string $repositoryFactoryClass */
            $repositoryFactoryClass = $container->getParameter($repositoryFactoryClassParameterName);
        }

        if ($metadata->hasClass('repository')) {
            $repositoryClass = $metadata->getClass('repository');
        }

        $definition = new Definition($repositoryFactoryClass);
        $definition->setPublic(true);
        $definition->setArguments([
            $metadata->getClass('model'),
            $repositoryClass,
        ]);

        $container->setDefinition($metadata->getServiceId('repository.factory'), $definition);

        foreach (class_implements($repositoryClass) ?: [] as $typehintClass) {
            $container->registerAliasForArgument(
                $metadata->getServiceId('repository.factory'),
                $typehintClass,
                $metadata->getHumanizedName() . ' repository factory',
            );
        }
    }

    protected function addManager(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        parent::addManager($container, $metadata);

        $container->registerAliasForArgument(
            $metadata->getServiceId('manager'),
            EntityManagerInterface::class,
            $metadata->getHumanizedName() . ' manager',
        );
    }

    protected function getManagerServiceId(MetadataInterface $metadata): string
    {
        if ($objectManagerName = $this->getObjectManagerName($metadata)) {
            return sprintf('doctrine.orm.%s_entity_manager', $objectManagerName);
        }

        return 'doctrine.orm.entity_manager';
    }

    protected function getClassMetadataClassname(): string
    {
        return ClassMetadata::class;
    }
}
