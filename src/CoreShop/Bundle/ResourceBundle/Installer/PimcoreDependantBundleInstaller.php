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

use Pimcore\Extension\Bundle\Exception\BundleNotFoundException;
use Pimcore\Extension\Bundle\PimcoreBundleManager;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;

final class PimcoreDependantBundleInstaller implements ResourceInstallerInterface
{
    public function __construct(
        private KernelInterface $kernel,
        private PimcoreBundleManager $bundleManager,
    ) {
    }

    public function installResources(OutputInterface $output, ?string $applicationName = null, array $options = []): void
    {
        $parameter = $applicationName ?
            sprintf('%s.dependant.bundles', $applicationName) :
            'coreshop.all.dependant.bundles';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            /**
             * @var array $bundlesToInstall
             */
            $bundlesToInstall = $this->kernel->getContainer()->getParameter($parameter);

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');

            $progress->start(count($bundlesToInstall));

            foreach ($bundlesToInstall as $bundleName) {
                $progress->setMessage(sprintf('Install Bundle "%s"', $bundleName));

                try {
                    /**
                     * @psalm-suppress InternalMethod
                     */
                    $bundle = $this->bundleManager->getActiveBundle($bundleName, false);

                    /**
                     * @psalm-suppress InternalMethod
                     */
                    if ($this->bundleManager->canBeInstalled($bundle)) {
                        /**
                         * @psalm-suppress InternalMethod
                         */
                        $this->bundleManager->install($bundle);
                    }
                } catch (BundleNotFoundException) {
                    $progress->setMessage(sprintf('<error>Bundle not found "%s"</error>', $bundleName));
                }

                $progress->advance();
            }

            $progress->finish();
            $progress->clear();

            $output->writeln('  - <info>Dependant Bundles have been installed successfully</info>');
        }
    }
}
