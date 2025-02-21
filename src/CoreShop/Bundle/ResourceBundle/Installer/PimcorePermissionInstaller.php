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
use Doctrine\DBAL\Schema\Column;
use Pimcore\Model\User\Permission;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;

final class PimcorePermissionInstaller implements ResourceInstallerInterface
{
    public function __construct(
        private KernelInterface $kernel,
        private Connection $connection,
    ) {
    }

    public function installResources(OutputInterface $output, ?string $applicationName = null, array $options = []): void
    {
        $parameter = $applicationName ? sprintf('%s.permissions', $applicationName) : 'coreshop.all.permissions';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            /**
             * @var array $permissionGroups
             */
            $permissionGroups = $this->kernel->getContainer()->getParameter($parameter);

            if ($parameter !== 'coreshop.all.permissions') {
                if (null !== $applicationName) {
                    $permissionGroups = [
                        $applicationName => $permissionGroups,
                    ];
                } else {
                    $permissionGroups = [
                        'all' => $permissionGroups,
                    ];
                }
            }

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');
            $progress->start(count($permissionGroups, \COUNT_RECURSIVE));

            $columns = array_map(function (Column $column) {
                return $column->getName();
            }, $this->connection->createSchemaManager()->listTableColumns('users_permission_definitions'));

            foreach ($permissionGroups as $group => $permissions) {
                foreach ($permissions as $permission) {
                    $progress->setMessage(sprintf('Install Permission %s', $permission));

                    $permissionDefinition = Permission\Definition::getByKey($permission);

                    if (!$permissionDefinition instanceof Permission\Definition) {
                        $this->connection->insert('users_permission_definitions', [
                            '`key`' => $permission,
                            'category' => sprintf('coreshop_permission_group_%s', $group),
                        ]);
                    }

                    $progress->advance();
                }
            }

            $progress->finish();
            $progress->clear();

            $output->writeln('  - <info>Permissions have been installed successfully</info>');
        }
    }
}
