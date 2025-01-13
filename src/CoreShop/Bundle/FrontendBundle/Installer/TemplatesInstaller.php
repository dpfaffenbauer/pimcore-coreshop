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
use Symfony\Component\Finder\Finder;

class TemplatesInstaller implements FrontendInstallerInterface
{
    public function installFrontend(string $frontendBundlePath, string $rootPath, string $templatePath): void
    {
        $finder = new Finder();
        $finder
            ->in($frontendBundlePath . '/Resources/views')
            ->name('*.twig')
        ;

        $twigFiles = $finder->files();

        $fs = new Filesystem();

        if (!$fs->exists($templatePath . '/coreshop')) {
            $fs->mkdir($templatePath . '/coreshop');
        }

        foreach ($twigFiles as $twigFile) {
            $newFileName = $templatePath . '/coreshop/' . $twigFile->getRelativePathname();

            if ($fs->exists($newFileName)) {
                continue;
            }

            $twigContent = file_get_contents($twigFile->getRealPath());
            $twigContent = str_replace(
                ['@CoreShopFrontend/', 'bundles/coreshopfrontend/'],
                ['', 'coreshop/'],
                $twigContent,
            );

            $fs->dumpFile($newFileName, $twigContent);
        }
    }
}
