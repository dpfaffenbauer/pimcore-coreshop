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

namespace CoreShop\Bundle\ProductBundle;

use CoreShop\Bundle\MoneyBundle\CoreShopMoneyBundle;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductCustomAttributesCalculatorsPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductDiscountCalculatorsPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductDiscountPriceCalculatorsPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductPriceRuleActionPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductPriceRuleConditionPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductRetailPriceCalculatorsPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductSpecificPriceRuleActionPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductSpecificPriceRuleConditionPass;
use CoreShop\Bundle\ProductBundle\DependencyInjection\Compiler\ProductValidPriceRuleFetcherPass;
use CoreShop\Bundle\ResourceBundle\AbstractResourceBundle;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\RuleBundle\CoreShopRuleBundle;
use Pimcore\HttpKernel\BundleCollection\BundleCollection;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class CoreShopProductBundle extends AbstractResourceBundle
{
    public function getSupportedDrivers(): array
    {
        return [
            CoreShopResourceBundle::DRIVER_DOCTRINE_ORM,
        ];
    }

    public function build(ContainerBuilder $container): void
    {
        parent::build($container);

        $container->addCompilerPass(new ProductPriceRuleConditionPass());
        $container->addCompilerPass(new ProductPriceRuleActionPass());
        $container->addCompilerPass(new ProductSpecificPriceRuleConditionPass());
        $container->addCompilerPass(new ProductSpecificPriceRuleActionPass());
        $container->addCompilerPass(new ProductValidPriceRuleFetcherPass());

        $container->addCompilerPass(new ProductRetailPriceCalculatorsPass());
        $container->addCompilerPass(new ProductDiscountPriceCalculatorsPass());
        $container->addCompilerPass(new ProductDiscountCalculatorsPass());
        $container->addCompilerPass(new ProductCustomAttributesCalculatorsPass());
    }

    public static function registerDependentBundles(BundleCollection $collection): void
    {
        parent::registerDependentBundles($collection);

        $collection->addBundle(new CoreShopMoneyBundle(), 3600);
        $collection->addBundle(new CoreShopRuleBundle(), 3500);
    }

    protected function getModelNamespace(): string
    {
        return 'CoreShop\Component\Product\Model';
    }
}
