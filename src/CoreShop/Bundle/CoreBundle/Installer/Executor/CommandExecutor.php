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

namespace CoreShop\Bundle\CoreBundle\Installer\Executor;

use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Process\Exception\RuntimeException;

final class CommandExecutor
{
    public function __construct(
        private InputInterface $input,
        private OutputInterface $output,
        private Application $application,
    ) {
    }

    public function runCommand($command, $parameters = [], ?OutputInterface $output = null): self
    {
        $parameters = array_merge(
            ['command' => $command],
            $this->getDefaultParameters(),
            $parameters,
        );

        $this->application->setAutoExit(false);
        $exitCode = $this->application->run(new ArrayInput($parameters), $output ?: new NullOutput());

        if (1 === $exitCode) {
            throw new RuntimeException('This command terminated with a permission error.');
        }

        if (0 !== $exitCode) {
            $this->application->setAutoExit(true);

            $errorMessage = sprintf('The command terminated with an error code: %u.', $exitCode);
            $this->output->writeln("<error>$errorMessage</error>");

            throw new \Exception($errorMessage, $exitCode);
        }

        return $this;
    }

    private function getDefaultParameters(): array
    {
        $defaultParameters = ['--no-debug' => true];

        if ($this->input->hasOption('env')) {
            $defaultParameters['--env'] = $this->input->hasOption('env') ? $this->input->getOption('env') : 'dev';
        }

        if ($this->input->hasOption('no-interaction') && true === $this->input->getOption('no-interaction')) {
            $defaultParameters['--no-interaction'] = true;
        }

        if ($this->input->hasOption('verbose') && true === $this->input->getOption('verbose')) {
            $defaultParameters['--verbose'] = true;
        }

        return $defaultParameters;
    }
}
