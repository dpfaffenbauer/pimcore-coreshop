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

namespace CoreShop\Bundle\CustomerBundle\DependencyInjection;

use CoreShop\Bundle\CustomerBundle\Attribute\AsCustomerContext;
use CoreShop\Bundle\CustomerBundle\Attribute\AsRequestResolverBasedCustomerContext;
use CoreShop\Bundle\CustomerBundle\DependencyInjection\Compiler\CompositeCustomerContextPass;
use CoreShop\Bundle\CustomerBundle\DependencyInjection\Compiler\CompositeRequestResolverPass;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use CoreShop\Component\Customer\Context\CustomerContextInterface;
use CoreShop\Component\Customer\Context\RequestBased\RequestResolverInterface;
use CoreShop\Component\Registry\Autoconfiguration;
use Pimcore\Bundle\NewsletterBundle\PimcoreNewsletterBundle;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

final class CoreShopCustomerExtension extends AbstractModelExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $this->registerPimcoreModels('coreshop', $configs['pimcore'], $container);
        $this->registerPimcoreResources('coreshop', $configs['pimcore_admin'], $container);
        $this->registerStack('coreshop', $configs['stack'], $container);
        $this->registerDependantBundles('coreshop', [PimcoreNewsletterBundle::class], $container);

        $container->setParameter('coreshop.customer.security.login_identifier', $configs['login_identifier']);

        $loader->load('services.yml');

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            CustomerContextInterface::class,
            CompositeCustomerContextPass::CUSTOMER_CONTEXT_SERVICE_TAG,
            AsCustomerContext::class,
            $configs['autoconfigure_with_attributes'],
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            RequestResolverInterface::class,
            CompositeRequestResolverPass::CUSTOMER_REQUEST_RESOLVER_SERVICE_TAG,
            AsRequestResolverBasedCustomerContext::class,
            $configs['autoconfigure_with_attributes'],
        );
    }
}
