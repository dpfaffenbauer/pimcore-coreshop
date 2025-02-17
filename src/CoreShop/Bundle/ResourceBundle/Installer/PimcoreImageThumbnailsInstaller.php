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

use CoreShop\Bundle\ResourceBundle\Installer\Configuration\ImageThumbnailConfiguration;
use Pimcore\Model\Asset\Image\Thumbnail\Config;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Yaml\Yaml;

final class PimcoreImageThumbnailsInstaller implements ResourceInstallerInterface
{
    public function __construct(
        private KernelInterface $kernel,
    ) {
    }

    public function installResources(OutputInterface $output, string $applicationName = null, array $options = []): void
    {
        $parameter = $applicationName ? sprintf('%s.pimcore.admin.install.image_thumbnails', $applicationName) : 'coreshop.all.pimcore.admin.install.image_thumbnails';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            /**
             * @var array $thumbnailFilesToInstall
             */
            $thumbnailFilesToInstall = $this->kernel->getContainer()->getParameter($parameter);
            $thumbnailsToInstall = [];

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');

            $processor = new Processor();
            $configurationDefinition = new ImageThumbnailConfiguration();

            foreach ($thumbnailFilesToInstall as $file) {
                $file = $this->kernel->locateResource($file);

                if (file_exists($file)) {
                    $content = file_get_contents($file);

                    if (!$content) {
                        continue;
                    }

                    $thumbnails = Yaml::parse($content);
                    $thumbnails = $processor->processConfiguration($configurationDefinition, ['thumbnails' => $thumbnails]);
                    $thumbnails = $thumbnails['thumbnails'];

                    foreach ($thumbnails as $name => $thumbnailData) {
                        $thumbnailsToInstall[$name] = $thumbnailData;
                    }
                }
            }

            $progress->start(count($thumbnailsToInstall));

            foreach ($thumbnailsToInstall as $name => $thumbnailData) {
                $progress->setMessage(sprintf('Install Image Thumbnail %s', $name));

                $this->installThumbnail($name, $thumbnailData);

                $progress->advance();
            }

            $progress->finish();
            $progress->clear();

            $output->writeln('  - <info>Image Thumbnails have been installed successfully</info>');
        }
    }

    private function installThumbnail(string $name, array $properties): Config
    {
        $thumbnailConfig = new Config();

        try {
            /**
             * @var Config\Dao $dao
             */
            $dao = $thumbnailConfig->getDao();
            /**
             * @psalm-suppress InternalMethod
             */
            $dao->getByName($name);
        } catch (\Exception) {
            //Thumbnail does not exist, so we install it
            $thumbnailConfig = new Config();
            $thumbnailConfig->setName($name);
            $thumbnailConfig->setItems($properties['items']);
            $thumbnailConfig->setDescription($properties['description'] ?? '');
            $thumbnailConfig->setGroup($properties['group']);
            $thumbnailConfig->setFormat($properties['format']);
            $thumbnailConfig->setQuality($properties['quality']);
            $thumbnailConfig->setHighResolution($properties['highResolution']);
            $thumbnailConfig->setPreserveColor($properties['preserveColor']);
            $thumbnailConfig->setPreserveMetaData($properties['preserveMetaData']);
            $thumbnailConfig->save();
        }

        return $thumbnailConfig;
    }
}
