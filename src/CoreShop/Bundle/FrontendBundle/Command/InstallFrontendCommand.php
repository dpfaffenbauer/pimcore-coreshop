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

namespace CoreShop\Bundle\FrontendBundle\Command;

use CoreShop\Bundle\CoreBundle\Command\AbstractInstallCommand;
use CoreShop\Bundle\CoreBundle\Installer\Checker\CommandDirectoryChecker;
use CoreShop\Bundle\FrontendBundle\Installer\FrontendInstallerInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;

final class InstallFrontendCommand extends AbstractInstallCommand
{
    public function __construct(
        KernelInterface $kernel,
        CommandDirectoryChecker $directoryChecker,
        protected FrontendInstallerInterface $frontendInstaller,
    ) {
        parent::__construct($kernel, $directoryChecker);
    }

    protected function configure(): void
    {
        $this
            ->setName('coreshop:frontend:install')
            ->setDescription('Install CoreShop Demo Frontend.')
            ->setHelp(
                <<<EOT
The <info>%command.name%</info> command install CoreShop Frontend Controllers/Templates/Configs.
EOT
            )
            ->addOption('templatePath', null, InputOption::VALUE_OPTIONAL, 'Path to the template directory', 'templates')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $coreBundle = $this->kernel->getBundle('CoreShopFrontendBundle');
        $frontendBundlePath = $coreBundle->getPath();

        $rootPath = $this->kernel->getProjectDir();

        $templatePath = $rootPath . '/' . $input->getOption('templatePath');

        $this->frontendInstaller->installFrontend(
            $frontendBundlePath,
            $rootPath,
            $templatePath,
        );

        return 0;
    }
}
