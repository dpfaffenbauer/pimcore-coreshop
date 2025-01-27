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

namespace CoreShop\Bundle\CoreBundle\Installer\Checker;

use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Exception\IOException;
use Symfony\Component\Filesystem\Filesystem;

final class CommandDirectoryChecker
{
    private string $name;

    public function __construct(
        private Filesystem $filesystem,
    ) {
    }

    public function ensureDirectoryExists(string $directory, OutputInterface $output): void
    {
        if (is_dir($directory)) {
            return;
        }

        $directory = realpath($directory);

        if (!$directory) {
            return;
        }

        try {
            $this->filesystem->mkdir($directory, 0755);

            $output->writeln(sprintf('<comment>Created "%s" directory.</comment>', $directory));
            $output->writeln(sprintf('<comment>Created "%s" directory.</comment>', $directory));
        } catch (IOException) {
            $output->writeln('');
            $output->writeln('<error>Cannot run command due to unexisting directory (tried to create it automatically, failed).</error>');
            $output->writeln('');

            throw new \RuntimeException(sprintf(
                'Create directory "%s" and run command "<comment>%s</comment>"',
                $directory,
                $this->name,
            ));
        }
    }

    public function ensureDirectoryIsWritable(string $directory, OutputInterface $output): void
    {
        if (is_writable($directory)) {
            return;
        }

        $directory = realpath($directory);

        if (!$directory) {
            return;
        }

        try {
            $this->filesystem->chmod($directory, 0755);

            $output->writeln(sprintf('<comment>Changed "%s" permissions to 0755.</comment>', $directory));
        } catch (IOException) {
            $output->writeln('');
            $output->writeln('<error>Cannot run command due to bad directory permissions (tried to change permissions to 0755).</error>');
            $output->writeln('');

            throw new \RuntimeException(sprintf(
                'Set "%s" writable and run command "<comment>%s</comment>"',
                dirname($directory),
                $this->name,
            ));
        }
    }

    public function setCommandName(string $name): void
    {
        $this->name = $name;
    }
}
