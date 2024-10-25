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

class FrontendInstaller implements FrontendInstallerInterface
{
    public function __construct(private readonly \IteratorAggregate $installers)
    {
    }

    public function installFrontend(string $frontendBundlePath, string $rootPath, string $templatePath): void
    {
        foreach ($this->installers as $installer) {
            $installer->installFrontend($frontendBundlePath, $rootPath, $templatePath);
        }
    }
}
