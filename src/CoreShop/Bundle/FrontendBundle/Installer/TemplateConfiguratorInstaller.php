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

namespace CoreShop\Bundle\FrontendBundle\Installer;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Yaml\Yaml;

class TemplateConfiguratorInstaller implements FrontendInstallerInterface
{
    public function installFrontend(string $frontendBundlePath, string $rootPath, string $templatePath): void
    {
        $configFile = $rootPath . '/config/packages/coreshop_frontend.yaml';

        $configContent = <<<CONFIG
core_shop_frontend:
    view_prefix: 'coreshop'
CONFIG;
        $fs = new Filesystem();
        if (!file_exists($configFile)) {
            $fs->dumpFile($configFile, $configContent);

            return;
        }

        $configContent = file_get_contents($configFile);

        $content = Yaml::parse($configContent);

        if (!isset($content['core_shop_frontend']['view_prefix'])) {
            $content['core_shop_frontend']['view_prefix'] = 'coreshop';
        }

        $configContent = Yaml::dump($content, 4, 2);
        $fs->dumpFile($configFile, $configContent);
    }
}
