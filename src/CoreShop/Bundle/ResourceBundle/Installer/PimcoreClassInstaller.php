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

use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Component\Pimcore\DataObject\ClassInstallerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;

final class PimcoreClassInstaller implements PimcoreClassInstallerInterface
{
    public const OPTION_UPDATE_CLASSES = 'update-classes';

    private array $installedClasses = [];

    private array $installedCollections = [];

    private array $installedBricks = [];

    public function __construct(
        private KernelInterface $kernel,
        private ClassInstallerInterface $classInstaller,
    ) {
    }

    public function installResources(OutputInterface $output, ?string $applicationName = null, array $options = []): void
    {
        $parameter = $applicationName ? sprintf('%s.pimcore_classes', $applicationName) : 'coreshop.all.pimcore_classes';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            /**
             * @var array $pimcoreClasses
             */
            $pimcoreClasses = $this->kernel->getContainer()->getParameter($parameter);
            $fieldCollections = [];
            $bricks = [];
            $classes = [];

            foreach ($pimcoreClasses as $identifier => $pimcoreModel) {
                $modelName = explode('\\', $pimcoreModel['classes']['model']);
                $modelName = $modelName[count($modelName) - 1];

                if (array_key_exists('install_file', $pimcoreModel['classes'])) {
                    $type = $pimcoreModel['classes']['type'];

                    try {
                        $file = $this->kernel->locateResource($pimcoreModel['classes']['install_file']);

                        if ($type === CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT) {
                            //$this->createClass($file, $modelName, true);
                            $classes[$identifier] = [
                                'model' => $modelName,
                                'file' => $file,
                            ];
                        } elseif ($type === CoreShopResourceBundle::PIMCORE_MODEL_TYPE_FIELD_COLLECTION) {
                            $fieldCollections[$identifier] = [
                                'model' => $modelName,
                                'file' => $file,
                            ];
                        } elseif ($type === CoreShopResourceBundle::PIMCORE_MODEL_TYPE_BRICK) {
                            $bricks[$identifier] = [
                                'model' => $modelName,
                                'file' => $file,
                            ];
                        }
                    } catch (\InvalidArgumentException) {
                        //File not found, continue with next, maybe add some logging?
                    }
                }
            }

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');

            $progress->start(count($pimcoreClasses));

            foreach ($fieldCollections as $identifier => $fc) {
                $progress->setMessage(sprintf('Install Fieldcollection %s (%s)', $fc['model'], $fc['file']));

                $this->installedCollections[$identifier] = $this->classInstaller->createFieldCollection($fc['file'], $fc['model']);

                $progress->advance();
            }

            foreach ($classes as $identifier => $class) {
                $progress->setMessage(sprintf('Install Class %s (%s)', $class['model'], $class['file']));

                $this->installedClasses[$identifier] = $this->classInstaller->createClass(
                    $class['file'],
                    $class['model'],
                    $options[self::OPTION_UPDATE_CLASSES] ?? false,
                );

                $progress->advance();
            }

            foreach ($bricks as $identifier => $brick) {
                $progress->setMessage(sprintf('Install Brick %s (%s)', $brick['model'], $brick['file']));

                $this->installedBricks[$identifier] = $this->classInstaller->createBrick($brick['file'], $brick['model']);

                $progress->advance();
            }

            $progress->finish();
            $progress->clear();

            $output->writeln('  - <info>Classes have been installed successfully</info>');
        }
    }

    public function getInstalledClasses(): array
    {
        return $this->installedClasses;
    }

    public function getInstalledCollections(): array
    {
        return $this->installedCollections;
    }

    public function getInstalledBricks(): array
    {
        return $this->installedBricks;
    }
}
