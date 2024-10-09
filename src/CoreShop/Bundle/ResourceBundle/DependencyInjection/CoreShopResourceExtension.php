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

namespace CoreShop\Bundle\ResourceBundle\DependencyInjection;

use CoreShop\Bundle\PimcoreBundle\DependencyInjection\Extension\AbstractPimcoreExtension;
use CoreShop\Bundle\ResourceBundle\Attribute\AsPimcoreModel;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Compiler\RegisterInstallersPass;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Driver\DriverProvider;
use CoreShop\Bundle\ResourceBundle\EventListener\BodyListener;
use CoreShop\Bundle\ResourceBundle\Installer\ResourceInstallerInterface;
use CoreShop\Component\Resource\Metadata\Metadata;
use CoreShop\Component\Resource\Reflection\ClassReflection;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\Config\Loader\LoaderInterface;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Exception\InvalidArgumentException;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use function Symfony\Component\String\u;

final class CoreShopResourceExtension extends AbstractPimcoreExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $loader->load('services.yml');

        if ($configs['translation']['enabled']) {
            $loader->load('services/integrations/translation.yml');

            $container->setAlias('coreshop.translation_locale_provider', $configs['translation']['locale_provider']);
        }

        if (array_key_exists('pimcore_admin', $configs)) {
            $this->registerPimcoreResources('coreshop', $configs['pimcore_admin'], $container);
        }

        if (!$container->hasParameter('coreshop.all.pimcore_classes')) {
            $container->setParameter('coreshop.all.pimcore_classes', []);
        }

        if (!$container->hasParameter('coreshop.all.stack')) {
            $container->setParameter('coreshop.all.stack', []);
        }

        $bundles = $container->getParameter('kernel.bundles');

        if (array_key_exists('PimcoreDataHubBundle', $bundles)) {
            $loader->load('services/data_hub.yml');
        }

        $container->setParameter('coreshop.resources', []);
        $container->setParameter('coreshop.resource.mapping', $configs['mapping']);

        $this->autoRegisterPimcoreModels($configs, $container);

        $this->loadPersistence($configs['drivers'], $configs['resources'], $loader);
        $this->loadResources($configs['resources'], $container);
        $this->loadPimcoreModels($configs['pimcore'], $container);

        $bodyListener = new Definition(BodyListener::class);
        $bodyListener->addTag('kernel.event_listener', [
            'event' => 'kernel.request',
            'method' => 'onKernelRequest',
            'priority' => 10,
        ]);

        $container->setDefinition('coreshop.body_listener', $bodyListener);

        $container
            ->registerForAutoconfiguration(ResourceInstallerInterface::class)
            ->addTag(RegisterInstallersPass::INSTALLER_TAG)
        ;
    }

    private function autoRegisterPimcoreModels(array &$config, ContainerBuilder $container): void
    {
        /** @var array $pimcoreResources */
        $pimcoreResources = $config['pimcore'];

        /** @var array $mapping */
        $mapping = $container->getParameter('coreshop.resource.mapping');
        $paths = $mapping['paths'] ?? [];

        /** @var class-string $className */
        foreach (ClassReflection::getResourcesByPaths($paths) as $className) {
            $resourceAttributes = ClassReflection::getClassAttributes($className, AsPimcoreModel::class);

            foreach ($resourceAttributes as $resourceAttribute) {
                /** @var AsPimcoreModel $resource */
                $resource = $resourceAttribute->newInstance();
                $alias = $this->getResourceAlias($resource, $className);

                if ($pimcoreResources[$alias] ?? false) {
                    continue;
                }

                $pimcoreResources[$alias] = [
                    'options' => $resource->getOptions(),
                    'path' => $resource->getPath(),
                    'slug' => $resource->getSlug() ?: false,
                    'route' => $resource->getRoute(),
                    'classes' => [
                        'model' => $resource->getPimcoreModel(),
                        'pimcore_class_name' => '',
                        'interface' => $resource->getInterface(),
                        'factory' => $resource->getFactory(),
                        'admin_controller' => $resource->getAdminController(),
                        'repository' => $resource->getRepository(),
                        'install_file' => $resource->getInstallFile(),
                        'type' => $resource->getType(),
                        'pimcore_controller' => $resource->getPimcoreController(),
                    ],
                    'driver' => CoreShopResourceBundle::DRIVER_PIMCORE,
                ];
            }
        }

        $config['pimcore'] = $pimcoreResources;
    }

    private function getResourceAlias(AsPimcoreModel $resource, string $className): string
    {
        $alias = $resource->getAlias();

        if (null !== $alias) {
            return $alias;
        }

        $shortName = Container::underscore(substr(strrchr($className, '\\'), 1));

        return 'app.' . u($shortName)->snake()->toString();
    }

    private function loadPersistence(array $drivers, array $resources, LoaderInterface $loader): void
    {
        foreach ($resources as $alias => $resource) {
            if (!in_array($resource['driver'], $drivers, true)) {
                throw new InvalidArgumentException(sprintf(
                    'Resource "%s" uses driver "%s", but this driver has not been enabled.',
                    $alias,
                    $resource['driver'],
                ));
            }
        }

        foreach ($drivers as $driver) {
            $loader->load(sprintf('services/integrations/%s.yml', $driver));
        }
    }

    private function loadResources(array $loadedResources, ContainerBuilder $container): void
    {
        /**
         * @var array $resources
         */
        $resources = $container->hasParameter('coreshop.resources') ? $container->getParameter('coreshop.resources') : [];

        foreach ($loadedResources as $alias => $resourceConfig) {
            $metadata = Metadata::fromAliasAndConfiguration($alias, $resourceConfig);

            $resources[$alias] = $resourceConfig;
            $container->setParameter('coreshop.resources', $resources);

            DriverProvider::get($metadata)->load($container, $metadata);

            if ($metadata->hasParameter('translation')) {
                $alias .= '_translation';
                $resourceConfig = array_merge(['driver' => $resourceConfig['driver']], $resourceConfig['translation']);

                $resources[$alias] = $resourceConfig;
                $container->setParameter('coreshop.resources', $resources);

                $metadata = Metadata::fromAliasAndConfiguration($alias, $resourceConfig);

                DriverProvider::get($metadata)->load($container, $metadata);
            }
        }
    }

    protected function loadPimcoreModels(array $models, ContainerBuilder $container): void
    {
        foreach ($models as $alias => $resourceConfig) {
            $resourceConfig['driver'] = CoreShopResourceBundle::DRIVER_PIMCORE;
            $resourceConfig['pimcore_class'] = match ($resourceConfig['classes']['type']) {
                CoreShopResourceBundle::PIMCORE_MODEL_TYPE_FIELD_COLLECTION => str_replace(
                    'Pimcore\Model\DataObject\Fieldcollection\Data\\',
                    '',
                    $resourceConfig['classes']['model'],
                ),
                CoreShopResourceBundle::PIMCORE_MODEL_TYPE_BRICK => str_replace(
                    'Pimcore\Model\DataObject\Objectbrick\Data\\',
                    '',
                    $resourceConfig['classes']['model'],
                ),
                default => str_replace(
                    'Pimcore\Model\DataObject\\',
                    '',
                    $resourceConfig['classes']['model'],
                ),
            };

            $metadata = Metadata::fromAliasAndConfiguration($alias, $resourceConfig);

            foreach (['coreshop.all.pimcore_classes', sprintf('%s.pimcore_classes', $metadata->getApplicationName())] as $parameter) {
                /**
                 * @var array $resources
                 */
                $resources = $container->hasParameter($parameter) ? $container->getParameter($parameter) : [];
                $resources[$alias] = $resourceConfig;

                $container->setParameter($parameter, $resources);
            }

            DriverProvider::get($metadata)->load($container, $metadata);
        }
    }
}
