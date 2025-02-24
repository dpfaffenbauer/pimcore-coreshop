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

namespace CoreShop\Bundle\FrontendBundle;

use Composer\InstalledVersions;
use CoreShop\Bundle\CoreBundle\CoreShopCoreBundle;
use CoreShop\Bundle\FrontendBundle\DependencyInjection\CompilerPass\RegisterFrontendControllerPass;
use EmailizrBundle\EmailizrBundle;
use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\HttpKernel\Bundle\DependentBundleInterface;
use Pimcore\HttpKernel\BundleCollection\BundleCollection;
use Symfony\Component\DependencyInjection\Compiler\PassConfig;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class CoreShopFrontendBundle extends AbstractPimcoreBundle implements DependentBundleInterface
{
    public static function registerDependentBundles(BundleCollection $collection): void
    {
        $collection->addBundle(new CoreShopCoreBundle(), 100);
        $collection->addBundle(new EmailizrBundle(), 1000);
    }

    public function build(ContainerBuilder $container): void
    {
        parent::build($container);

        $container->addCompilerPass(new RegisterFrontendControllerPass(), PassConfig::TYPE_BEFORE_OPTIMIZATION, 100);
    }

    public function getNiceName(): string
    {
        return 'CoreShop - Frontend';
    }

    public function getDescription(): string
    {
        return 'CoreShop - Frontend Bundle';
    }

    public function getVersion(): string
    {
        if (class_exists('\\CoreShop\\Bundle\\CoreBundle\\Application\\Version')) {
            return \CoreShop\Bundle\CoreBundle\Application\Version::getVersion() . ' (' . $this->getComposerVersion() . ')';
        }

        return $this->getComposerVersion();
    }

    public function getComposerVersion(): string
    {
        $bundleName = 'coreshop/frontend-bundle';

        if (class_exists(InstalledVersions::class)) {
            if (InstalledVersions::isInstalled('coreshop/core-shop')) {
                return InstalledVersions::getPrettyVersion('coreshop/core-shop');
            }

            if (InstalledVersions::isInstalled($bundleName)) {
                return InstalledVersions::getPrettyVersion($bundleName);
            }
        }

        return '';
    }
}
