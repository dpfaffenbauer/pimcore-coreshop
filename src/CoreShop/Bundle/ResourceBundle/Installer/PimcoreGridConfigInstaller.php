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

namespace CoreShop\Bundle\ResourceBundle\Installer;

use CoreShop\Bundle\ResourceBundle\Installer\Configuration\GridConfigConfiguration;
use CoreShop\Bundle\ResourceBundle\Pimcore\ObjectManager;
use CoreShop\Component\Pimcore\DataObject\GridConfigInstallerInterface;
use CoreShop\Component\Resource\Metadata\RegistryInterface;
use CoreShop\Component\Resource\Repository\PimcoreRepositoryInterface;
use Pimcore\Model\DataObject\ClassDefinition;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Yaml\Yaml;

final class PimcoreGridConfigInstaller implements ResourceInstallerInterface
{
    public function __construct(
        private KernelInterface $kernel,
        private RegistryInterface $metaDataRegistry,
        private ObjectManager $objectManager,
        private GridConfigInstallerInterface $gridConfigInstaller,
        private PimcoreClassInstallerInterface $pimcoreClassInstaller,
    ) {
    }

    public function installResources(OutputInterface $output, string $applicationName = null, array $options = []): void
    {
        $parameter = $applicationName ? sprintf('%s.pimcore.admin.install.grid_config', $applicationName) : 'coreshop.all.pimcore.admin.install.grid_config';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            /**
             * @var array $routeFilesToInstall
             */
            $routeFilesToInstall = $this->kernel->getContainer()->getParameter($parameter);
            $gridConfigsToInstall = [];

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');

            $processor = new Processor();
            $configurationDefinition = new GridConfigConfiguration();

            foreach ($routeFilesToInstall as $file) {
                $file = $this->kernel->locateResource($file);

                if (file_exists($file)) {
                    $content = file_get_contents($file);

                    if (!$content) {
                        continue;
                    }

                    $gridConfigs = Yaml::parse($content);
                    $gridConfigs = $processor->processConfiguration($configurationDefinition, ['grid_config' => $gridConfigs]);
                    $gridConfigs = $gridConfigs['grid_config'];

                    foreach ($gridConfigs as $name => $gridConfigData) {
                        $gridConfigsToInstall[$name] = $gridConfigData;
                    }
                }
            }

            $progress->start(count($gridConfigsToInstall));

            foreach ($gridConfigsToInstall as $name => $gridData) {
                $progress->setMessage(sprintf('Install Grid Config %s', $name));

                $this->gridConfigInstaller->installGridConfig($gridData['data'], $gridData['name'], $this->findClassId($gridData['class']), true);

                $progress->advance();
            }

            $progress->finish();
            $progress->clear();

            $output->writeln('  - <info>Grid Configs have been installed successfully</info>');
        }
    }

    private function findClassId(string $classIdentifier): string
    {
        $metadata = $this->metaDataRegistry->get($classIdentifier);

        try {
            /**
             * @var PimcoreRepositoryInterface $repository
             */
            $repository = $this->objectManager->getRepository($metadata->getParameter('model'));

            return $repository->getClassId();
        } catch (\InvalidArgumentException) {
        }

        $freshlyInstalledClasses = $this->pimcoreClassInstaller->getInstalledClasses();

        if (isset($freshlyInstalledClasses[$classIdentifier])) {
            $class = $freshlyInstalledClasses[$classIdentifier];

            if ($class instanceof ClassDefinition) {
                return $class->getId();
            }
        }

        throw new \InvalidArgumentException(sprintf('Could\'nt find ClassID for Identifier %s', $classIdentifier));
    }
}
