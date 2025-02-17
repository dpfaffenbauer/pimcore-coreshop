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

namespace CoreShop\Bundle\FrontendBundle\DependencyInjection;

use CoreShop\Bundle\FrontendBundle\Controller\CartController;
use CoreShop\Bundle\FrontendBundle\Controller\CategoryController;
use CoreShop\Bundle\FrontendBundle\Controller\CheckoutController;
use CoreShop\Bundle\FrontendBundle\Controller\CurrencyController;
use CoreShop\Bundle\FrontendBundle\Controller\CustomerController;
use CoreShop\Bundle\FrontendBundle\Controller\IndexController;
use CoreShop\Bundle\FrontendBundle\Controller\MailController;
use CoreShop\Bundle\FrontendBundle\Controller\OrderController;
use CoreShop\Bundle\FrontendBundle\Controller\ProductController;
use CoreShop\Bundle\FrontendBundle\Controller\QuoteController;
use CoreShop\Bundle\FrontendBundle\Controller\RegisterController;
use CoreShop\Bundle\FrontendBundle\Controller\SearchController;
use CoreShop\Bundle\FrontendBundle\Controller\SecurityController;
use CoreShop\Bundle\PayumBundle\Controller\PaymentController;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

final class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('core_shop_frontend');
        /** @var ArrayNodeDefinition $rootNode */
        $rootNode = $treeBuilder->getRootNode();

        $rootNode
            ->children()
                ->scalarNode('view_suffix')->defaultValue('twig')->end()
                ->scalarNode('view_bundle')->setDeprecated('coreshop_frontend', '4.1', 'Use view_prefix instead')->defaultValue('@CoreShopFrontend')->end()
                ->scalarNode('view_prefix')->defaultValue('@CoreShopFrontend')->end()
            ->end()
        ;

        $this->addCategorySection($rootNode);
        $this->addPimcoreResourcesSection($rootNode);
        $this->addControllerSection($rootNode);

        return $treeBuilder;
    }

    private function addCategorySection(ArrayNodeDefinition $node): void
    {
        $node->children()
            ->arrayNode('category')
                ->addDefaultsIfNotSet()
                ->children()
                    ->arrayNode('valid_sort_options')
                        ->defaultValue(['name'])
                        ->scalarPrototype()->end()
                    ->end()
                    ->scalarNode('default_sort_name')->defaultValue('name')->end()
                    ->scalarNode('default_sort_direction')
                        ->defaultValue('asc')
                        ->validate()
                            ->ifNotInArray(['asc', 'desc'])
                            ->thenInvalid('Supported values are asc, desc.')
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;
    }

    private function addControllerSection(ArrayNodeDefinition $node): void
    {
        $node->children()
            ->arrayNode('controllers')
                ->addDefaultsIfNotSet()
                ->children()
                    ->scalarNode('index')->defaultValue(IndexController::class)->end()
                    ->scalarNode('register')->defaultValue(RegisterController::class)->end()
                    ->scalarNode('customer')->defaultValue(CustomerController::class)->end()
                    ->scalarNode('currency')->defaultValue(CurrencyController::class)->end()
                    ->scalarNode('search')->defaultValue(SearchController::class)->end()
                    ->scalarNode('cart')->defaultValue(CartController::class)->end()
                    ->scalarNode('checkout')->defaultValue(CheckoutController::class)->end()
                    ->scalarNode('order')->defaultValue(OrderController::class)->end()
                    ->scalarNode('category')->defaultValue(CategoryController::class)->end()
                    ->scalarNode('product')->defaultValue(ProductController::class)->end()
                    ->scalarNode('quote')->defaultValue(QuoteController::class)->end()
                    ->scalarNode('security')->defaultValue(SecurityController::class)->end()
                    ->scalarNode('payment')->defaultValue(PaymentController::class)->end()
                    ->scalarNode('mail')->defaultValue(MailController::class)->end()
                ->end()
            ->end()
        ;
    }

    private function addPimcoreResourcesSection(ArrayNodeDefinition $node): void
    {
        $node->children()
            ->arrayNode('pimcore_admin')
                ->addDefaultsIfNotSet()
                ->children()
                    ->arrayNode('install')
                        ->addDefaultsIfNotSet()
                        ->children()
                            ->arrayNode('routes')
                                ->treatNullLike([])
                                ->scalarPrototype()->end()
                                ->defaultValue(['@CoreShopFrontendBundle/Resources/install/pimcore/staticroutes.yml'])
                            ->end()
                            ->arrayNode('documents')
                                ->treatNullLike([])
                                ->scalarPrototype()->end()
                                ->defaultValue(['@CoreShopFrontendBundle/Resources/install/pimcore/documents.yml'])
                            ->end()
                            ->arrayNode('image_thumbnails')
                                ->treatNullLike([])
                                ->scalarPrototype()->end()
                                ->defaultValue(['@CoreShopFrontendBundle/Resources/install/pimcore/image-thumbnails.yml'])
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end()
        ->end()
        ;
    }
}
