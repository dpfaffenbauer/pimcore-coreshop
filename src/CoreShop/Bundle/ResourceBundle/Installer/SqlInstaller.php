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

use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;

final class SqlInstaller implements ResourceInstallerInterface
{
    public function __construct(
        private KernelInterface $kernel,
        private Connection $connection,
    ) {
    }

    public function installResources(OutputInterface $output, ?string $applicationName = null, array $options = []): void
    {
        $parameter = $applicationName ? sprintf('%s.pimcore.admin.install.sql', $applicationName) : 'coreshop.all.pimcore.admin.install.sql';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            /**
             * @var array $sqlFilesToExecute
             */
            $sqlFilesToExecute = $this->kernel->getContainer()->getParameter($parameter);

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');

            $progress->start(count($sqlFilesToExecute));

            foreach ($sqlFilesToExecute as $sqlFile) {
                $progress->setMessage(sprintf('<info>Execute SQL File %s</info>', $sqlFile));

                $content = file_get_contents($this->kernel->locateResource($sqlFile));

                if (!$content) {
                    continue;
                }

                $this->connection->executeQuery($content);

                $progress->advance();
            }

            $progress->finish();
            $progress->clear();

            $output->writeln('  - <info>SQLs have been installed successfully</info>');
        }
    }
}
