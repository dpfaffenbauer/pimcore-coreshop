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

use CoreShop\Bundle\ResourceBundle\Installer\Configuration\RouteConfiguration;
use Pimcore\Bundle\StaticRoutesBundle\Model\Staticroute;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Yaml\Yaml;

final class PimcoreRoutesInstaller implements ResourceInstallerInterface
{
    public function __construct(
        private KernelInterface $kernel,
    ) {
    }

    public function installResources(OutputInterface $output, ?string $applicationName = null, array $options = []): void
    {
        $parameter = $applicationName ? sprintf('%s.pimcore.admin.install.routes', $applicationName) : 'coreshop.all.pimcore.admin.install.routes';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            /**
             * @var array $routeFilesToInstall
             */
            $routeFilesToInstall = $this->kernel->getContainer()->getParameter($parameter);
            $routesToInstall = [];

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');

            $processor = new Processor();
            $configurationDefinition = new RouteConfiguration();

            foreach ($routeFilesToInstall as $file) {
                $file = $this->kernel->locateResource($file);

                if (file_exists($file)) {
                    $content = file_get_contents($file);

                    if (!$content) {
                        continue;
                    }

                    $routes = Yaml::parse($content);
                    $routes = $processor->processConfiguration($configurationDefinition, ['staticroutes' => $routes]);
                    $routes = $routes['routes'];

                    foreach ($routes as $name => $routeData) {
                        if (isset($options['allowed']) && is_array($options['allowed']) && !in_array($name, $options['allowed'])) {
                            continue;
                        }
                        $routesToInstall[$name] = $routeData;
                    }
                }
            }

            $progress->start(count($routesToInstall));

            foreach ($routesToInstall as $name => $routeData) {
                $progress->setMessage(sprintf('Install Route %s', $name));

                $this->installRoute($name, $routeData);

                $progress->advance();
            }

            $progress->finish();
            $progress->clear();

            $output->writeln('  - <info>Static Routes have been installed successfully</info>');
        }
    }

    private function installRoute(string $name, array $properties): Staticroute
    {
        $route = Staticroute::getByName($name);

        if (!$route) {
            $route = new Staticroute();
            $route->setId($name);
            $route->setName($name);
            $route->setMethods($properties['methods']);
            $route->setPattern($properties['pattern']);
            $route->setReverse($properties['reverse']);
            $route->setController($properties['controller']);
            $route->setVariables($properties['variables']);
            $route->setPriority($properties['priority']);

            $route->save();
        }

        return $route;
    }
}
