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

namespace CoreShop\Bundle\ResourceBundle\DependencyInjection\Driver\Pimcore;

use CoreShop\Bundle\ResourceBundle\Controller\AdminController;
use CoreShop\Bundle\ResourceBundle\Controller\ViewHandlerInterface;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Driver\AbstractDriver;
use CoreShop\Bundle\ResourceBundle\Pimcore\ObjectManager;
use CoreShop\Bundle\ResourceBundle\Pimcore\PimcoreRepository;
use CoreShop\Component\Resource\Factory\PimcoreRepositoryFactory;
use CoreShop\Component\Resource\Metadata\MetadataInterface;
use Symfony\Component\DependencyInjection\Alias;
use Symfony\Component\DependencyInjection\ChildDefinition;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\DependencyInjection\Reference;

final class PimcoreDriver extends AbstractDriver
{
    public function getType(): string
    {
        return CoreShopResourceBundle::DRIVER_DOCTRINE_ORM;
    }

    public function load(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        parent::load($container, $metadata);

        if ($metadata->hasClass('pimcore_controller')) {
            if (is_array($metadata->getClass('pimcore_controller'))) {
                foreach ($metadata->getClass('pimcore_controller') as $suffix => $class) {
                    $this->addPimcoreController($container, $metadata, $class, $suffix);
                }
            } else {
                $this->addDefaultPimcoreController($container, $metadata);
            }
        }

        if ($metadata->hasParameter('path')) {
            $this->addPimcoreClass($container, $metadata);
        }

        $this->addRepositoryFactory($container, $metadata);
    }

    protected function setClassesParameters(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        parent::setClassesParameters($container, $metadata);

        if ($metadata->hasParameter('pimcore_class')) {
            $container->setParameter(sprintf('%s.model.%s.pimcore_class_name', $metadata->getApplicationName(), $metadata->getName()), $metadata->getParameter('pimcore_class'));
        }
    }

    protected function addDefaultPimcoreController(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        $this->addPimcoreController($container, $metadata, $metadata->getClass('pimcore_controller'));
    }

    protected function addPimcoreController(ContainerBuilder $container, MetadataInterface $metadata, string $classValue, string $suffix = null): void
    {
        $parents = array_values(class_parents($classValue) ?: []);

        if (in_array(AdminController::class, $parents, true)) {
            $definition = new ChildDefinition(AdminController::class);
        } else {
            $definition = new Definition();
        }

        $definition
            ->setClass($classValue)
            ->setPublic(true)
            ->setArguments([
                '$metadata' => $this->getMetadataDefinition($metadata),
                '$repository' => new Reference($metadata->getServiceId('repository')),
                '$factory' => new Reference($metadata->getServiceId('factory')),
                '$viewHandler' => new Reference(ViewHandlerInterface::class),
                '$parameterBag' => new Reference(ParameterBagInterface::class),
            ])
            ->addTag('controller.service_arguments')
            ->addTag('container.service_subscriber')
        ;

        $serviceId = $metadata->getServiceId('pimcore_controller');

        if (null !== $suffix && 'default' !== $suffix) {
            $serviceId .= '_' . $suffix;
        }

        $container->setDefinition($serviceId, $definition);
    }

    protected function addPimcoreClass(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        $folder = $metadata->getParameter('path');

        if (!is_array($folder)) {
            $folders = [$metadata->getName() => $folder];
        } else {
            $folders = $folder;
        }

        $parameterNameForAllAppPaths = sprintf('%s.folders', $metadata->getApplicationName());
        $parameterNameForAllPaths = 'coreshop.resource.folders';

        foreach ($folders as $folderType => $folder) {
            $paramName = sprintf('%s.folder.%s', $metadata->getApplicationName(), $folderType);
            $container->setParameter($paramName, $folder);

            foreach ([$parameterNameForAllPaths, $parameterNameForAllAppPaths] as $parameterName) {
                $allPaths = [];

                if ($container->hasParameter($parameterName)) {
                    /**
                     * @var array $allPaths
                     */
                    $allPaths = $container->getParameter($parameterName);
                }

                $allPaths[$paramName] = $folder;

                $container->setParameter($parameterName, $allPaths);
            }
        }
    }

    protected function addRepository(ContainerBuilder $container, MetadataInterface $metadata): void
    {
        $repositoryClassParameterName = sprintf('%s.repository.%s.class', $metadata->getApplicationName(), $metadata->getName());
        $repositoryClass = PimcoreRepository::class;

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
            $this->getMetadataDefinition($metadata),
            new Reference('doctrine.dbal.default_connection'),
        ]);
        $definition->addTag('coreshop.pimcore.repository', ['alias' => $metadata->getAlias()]);

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
        $repositoryFactoryClass = PimcoreRepositoryFactory::class;
        $repositoryClass = PimcoreRepository::class;

        if ($container->hasParameter($repositoryFactoryClassParameterName)) {
            /** @var string $repositoryFactoryClass */
            $repositoryFactoryClass = $container->getParameter($repositoryFactoryClassParameterName);
        }

        if ($metadata->hasClass('repository')) {
            /** @var string $repositoryClass */
            $repositoryClass = $metadata->getClass('repository');
        }

        $definition = new Definition($repositoryFactoryClass);
        $definition->setPublic(true);
        $definition->setArguments([
            $repositoryClass,
            $this->getMetadataDefinition($metadata),
            new Reference('doctrine.dbal.default_connection'),
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
        $alias = new Alias(ObjectManager::class);
        $alias->setPublic(true);

        $container->setAlias(
            $metadata->getServiceId('manager'),
            $alias,
        );

        $container->registerAliasForArgument(
            $metadata->getServiceId('manager'),
            ObjectManager::class,
            $metadata->getHumanizedName() . ' manager',
        );
    }
}
