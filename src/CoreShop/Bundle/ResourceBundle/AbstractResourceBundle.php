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

namespace CoreShop\Bundle\ResourceBundle;

use Composer\InstalledVersions;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Driver\Exception\UnknownDriverException;
use Doctrine\Bundle\DoctrineBundle\DependencyInjection\Compiler\DoctrineOrmMappingsPass;
use Pimcore\Extension\Bundle\Installer\InstallerInterface;
use Pimcore\Extension\Bundle\PimcoreBundleInterface;
use Pimcore\HttpKernel\Bundle\DependentBundleInterface;
use Pimcore\HttpKernel\BundleCollection\BundleCollection;
use Symfony\Component\Config\Definition\Exception\InvalidConfigurationException;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

abstract class AbstractResourceBundle extends Bundle implements PimcoreBundleInterface, ResourceBundleInterface, DependentBundleInterface, ComposerPackageBundleInterface
{
    protected string $mappingFormat = ResourceBundleInterface::MAPPING_XML;

    public function build(ContainerBuilder $container): void
    {
        if (null !== $this->getModelNamespace()) {
            foreach ($this->getSupportedDrivers() as $driver) {
                [$compilerPassClassName, $compilerPassMethod] = $this->getMappingCompilerPassInfo($driver);

                if (class_exists($compilerPassClassName)) {
                    if (!method_exists($compilerPassClassName, $compilerPassMethod)) {
                        throw new InvalidConfigurationException(
                            "The 'mappingFormat' value is invalid, must be 'xml', 'yml' or 'annotation'.",
                        );
                    }

                    switch ($this->mappingFormat) {
                        case ResourceBundleInterface::MAPPING_XML:
                        case ResourceBundleInterface::MAPPING_YAML:
                            $container->addCompilerPass($compilerPassClassName::$compilerPassMethod(
                                [$this->getConfigFilesPath() => $this->getModelNamespace()],
                                [$this->getObjectManagerParameter()],
                                sprintf('%s.driver.%s', $this->getBundlePrefix(), $driver),
                            ));

                            break;
                        case ResourceBundleInterface::MAPPING_ANNOTATION:
                            $container->addCompilerPass($compilerPassClassName::$compilerPassMethod(
                                [$this->getModelNamespace()],
                                [$this->getConfigFilesPath()],
                                [sprintf('%s.object_manager', $this->getBundlePrefix())],
                                sprintf('%s.driver.%s', $this->getBundlePrefix(), $driver),
                            ));

                            break;
                    }
                }
            }
        }
    }

    public static function registerDependentBundles(BundleCollection $collection): void
    {
        $collection->addBundle(new CoreShopResourceBundle(), 3800);
    }

    public function getVersion(): string
    {
        if (class_exists('\\CoreShop\\Bundle\\CoreBundle\\Application\\Version')) {
            return \CoreShop\Bundle\CoreBundle\Application\Version::getVersion() . ' (' . $this->getComposerVersion() . ')';
        }

        return $this->getComposerVersion();
    }

    public function getComposerVersion(): string
    {
        if ($this instanceof ComposerPackageBundleInterface) {
            $bundleName = $this->getPackageName();

            if (class_exists(InstalledVersions::class)) {
                if (InstalledVersions::isInstalled('coreshop/core-shop')) {
                    return InstalledVersions::getPrettyVersion('coreshop/core-shop');
                }

                if (InstalledVersions::isInstalled($bundleName)) {
                    return InstalledVersions::getPrettyVersion($bundleName);
                }
            }
        }

        return '';
    }

    protected function getBundlePrefix(): string
    {
        return Container::underscore(substr((string) strrchr($this::class, '\\'), 1, -6));
    }

    protected function getDoctrineMappingDirectory(): string
    {
        return 'model';
    }

    protected function getModelNamespace(): ?string
    {
        return null;
    }

    protected function getMappingCompilerPassInfo(string $driverType): array
    {
        $mappingsPassClassname = match ($driverType) {
            CoreShopResourceBundle::DRIVER_DOCTRINE_ORM => DoctrineOrmMappingsPass::class,
            default => throw new UnknownDriverException($driverType),
        };

        $compilerPassMethod = sprintf('create%sMappingDriver', ucfirst($this->mappingFormat));

        return [$mappingsPassClassname, $compilerPassMethod];
    }

    protected function getConfigFilesPath(): string
    {
        return sprintf(
            '%s/Resources/config/doctrine/%s',
            $this->getPath(),
            strtolower($this->getDoctrineMappingDirectory()),
        );
    }

    protected function getObjectManagerParameter(): string
    {
        return sprintf('%s.object_manager', $this->getBundlePrefix());
    }

    public function getNiceName(): string
    {
        $name = $this->getResourceBundleName();

        if ($name[0] === 'Core' && $name[1] === 'Shop') {
            return sprintf('CoreShop - %s', $name[2]);
        }

        return implode(' ', $name);
    }

    public function getDescription(): string
    {
        $name = $this->getResourceBundleName();

        if ($name[0] === 'Core' && $name[1] === 'Shop') {
            return sprintf('CoreShop - %s', $name[2]);
        }

        return implode(' ', $name);
    }

    private function getResourceBundleName(): array
    {
        $reflect = new \ReflectionClass($this);
        $split = preg_split('/(?=[A-Z])/', $reflect->getShortName());

        if (false === $split) {
            return [];
        }

        return array_values(array_filter(
            $split,
            static fn (string $value) => $value !== '',
        ));
    }

    public function getPackageName(): string
    {
        $name = $this->getResourceBundleName();

        if ($name[0] === 'Core' && $name[1] === 'Shop') {
            return sprintf('coreshop/%s-bundle', strtolower($name[2]));
        }

        return '';
    }

    public function getInstaller(): ?InstallerInterface
    {
        return null;
    }

    public function getAdminIframePath(): ?string
    {
        return null;
    }

    public function getJsPaths(): array
    {
        return [];
    }

    public function getCssPaths(): array
    {
        return [];
    }

    public function getEditmodeJsPaths(): array
    {
        return [];
    }

    public function getEditmodeCssPaths(): array
    {
        return [];
    }
}
