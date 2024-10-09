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

namespace CoreShop\Bundle\OrderBundle\DependencyInjection;

use CoreShop\Bundle\OrderBundle\Controller\AddressCreationController;
use CoreShop\Bundle\OrderBundle\Controller\CartPriceRuleController;
use CoreShop\Bundle\OrderBundle\Controller\CustomerCreationController;
use CoreShop\Bundle\OrderBundle\Controller\OrderCommentController;
use CoreShop\Bundle\OrderBundle\Controller\OrderController;
use CoreShop\Bundle\OrderBundle\Controller\OrderCreationController;
use CoreShop\Bundle\OrderBundle\Controller\OrderEditController;
use CoreShop\Bundle\OrderBundle\Controller\OrderInvoiceController;
use CoreShop\Bundle\OrderBundle\Controller\OrderPaymentController;
use CoreShop\Bundle\OrderBundle\Controller\OrderShipmentController;
use CoreShop\Bundle\OrderBundle\Doctrine\ORM\CartPriceRuleRepository;
use CoreShop\Bundle\OrderBundle\Doctrine\ORM\CartPriceRuleVoucherCodeCustomerRepository;
use CoreShop\Bundle\OrderBundle\Doctrine\ORM\CartPriceRuleVoucherRepository;
use CoreShop\Bundle\OrderBundle\Form\Type\CartPriceRuleTranslationType;
use CoreShop\Bundle\OrderBundle\Form\Type\CartPriceRuleType;
use CoreShop\Bundle\OrderBundle\Pimcore\Repository\OrderInvoiceRepository;
use CoreShop\Bundle\OrderBundle\Pimcore\Repository\OrderItemRepository;
use CoreShop\Bundle\OrderBundle\Pimcore\Repository\OrderRepository;
use CoreShop\Bundle\OrderBundle\Pimcore\Repository\OrderShipmentRepository;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Component\Order\Factory\CartPriceRuleVoucherCodeCustomerFactory;
use CoreShop\Component\Order\Model\AdjustmentInterface;
use CoreShop\Component\Order\Model\CartPriceRule;
use CoreShop\Component\Order\Model\CartPriceRuleInterface;
use CoreShop\Component\Order\Model\CartPriceRuleTranslation;
use CoreShop\Component\Order\Model\CartPriceRuleTranslationInterface;
use CoreShop\Component\Order\Model\CartPriceRuleVoucherCode;
use CoreShop\Component\Order\Model\CartPriceRuleVoucherCodeCustomer;
use CoreShop\Component\Order\Model\CartPriceRuleVoucherCodeCustomerInterface;
use CoreShop\Component\Order\Model\CartPriceRuleVoucherCodeInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Model\OrderInvoiceInterface;
use CoreShop\Component\Order\Model\OrderInvoiceItemInterface;
use CoreShop\Component\Order\Model\OrderItemAttributeInterface;
use CoreShop\Component\Order\Model\OrderItemInterface;
use CoreShop\Component\Order\Model\OrderShipmentInterface;
use CoreShop\Component\Order\Model\OrderShipmentItemInterface;
use CoreShop\Component\Order\Model\PriceRuleItemInterface;
use CoreShop\Component\Order\Model\ProposalCartPriceRuleItemInterface;
use CoreShop\Component\Order\Model\PurchasableInterface;
use CoreShop\Component\Resource\Factory\Factory;
use CoreShop\Component\Resource\Factory\PimcoreFactory;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

final class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('core_shop_order');
        /** @var ArrayNodeDefinition $rootNode */
        $rootNode = $treeBuilder->getRootNode();

        $rootNode
            ->children()
                ->booleanNode('allow_order_edit')->defaultFalse()->end()
                ->scalarNode('autoconfigure_with_attributes')->defaultFalse()->end()
                ->booleanNode('use_pimcore_pdf_rendering')->defaultFalse()->end()
            ->end()
        ;
        $this->addModelsSection($rootNode);
        $this->addPimcoreResourcesSection($rootNode);
        $this->addStack($rootNode);

        return $treeBuilder;
    }

    private function addStack(ArrayNodeDefinition $node): void
    {
        $node->children()
            ->arrayNode('stack')
                ->addDefaultsIfNotSet()
                ->children()
                    ->scalarNode('purchasable')->defaultValue(PurchasableInterface::class)->cannotBeEmpty()->end()
                    ->scalarNode('order')->defaultValue(OrderInterface::class)->cannotBeEmpty()->end()
                    ->scalarNode('order_item')->defaultValue(OrderItemInterface::class)->cannotBeEmpty()->end()
                    ->scalarNode('order_invoice')->defaultValue(OrderInvoiceInterface::class)->cannotBeEmpty()->end()
                    ->scalarNode('order_invoice_item')->defaultValue(OrderInvoiceItemInterface::class)->cannotBeEmpty()->end()
                    ->scalarNode('order_shipment')->defaultValue(OrderShipmentInterface::class)->cannotBeEmpty()->end()
                    ->scalarNode('order_shipment_item')->defaultValue(OrderShipmentItemInterface::class)->cannotBeEmpty()->end()
                ->end()
            ->end()
        ->end()
        ;
    }

    private function addModelsSection(ArrayNodeDefinition $node): void
    {
        $node
            ->children()
                ->arrayNode('resources')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->arrayNode('cart_price_rule')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->scalarNode('permission')->defaultValue('cart_price_rule')->cannotBeOverwritten()->end()
                                ->arrayNode('graphql')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->booleanNode('enabled')->defaultTrue()->end()
                                    ->end()
                                ->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue(CartPriceRule::class)->cannotBeEmpty()->end()
                                        ->scalarNode('interface')->defaultValue(CartPriceRuleInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('admin_controller')->defaultValue(CartPriceRuleController::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(Factory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->defaultValue(CartPriceRuleRepository::class)->end()
                                        ->scalarNode('form')->defaultValue(CartPriceRuleType::class)->cannotBeEmpty()->end()
                                    ->end()
                                ->end()
                                ->arrayNode('translation')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->variableNode('options')->end()
                                        ->arrayNode('classes')
                                            ->addDefaultsIfNotSet()
                                            ->children()
                                                ->scalarNode('model')->defaultValue(CartPriceRuleTranslation::class)->cannotBeEmpty()->end()
                                                ->scalarNode('interface')->defaultValue(CartPriceRuleTranslationInterface::class)->cannotBeEmpty()->end()
                                                ->scalarNode('repository')->cannotBeEmpty()->end()
                                                ->scalarNode('factory')->defaultValue(Factory::class)->end()
                                                ->scalarNode('form')->defaultValue(CartPriceRuleTranslationType::class)->cannotBeEmpty()->end()
                                            ->end()
                                        ->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('cart_price_rule_voucher_code')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue(CartPriceRuleVoucherCode::class)->cannotBeEmpty()->end()
                                        ->scalarNode('interface')->defaultValue(CartPriceRuleVoucherCodeInterface::class)->cannotBeEmpty()->end()
                                        //->scalarNode('admin_controller')->defaultValue(CartPriceRuleController::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(Factory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->defaultValue(CartPriceRuleVoucherRepository::class)->end()
                                        //TODO: ->scalarNode('form')->defaultValue(CartPriceRuleType::class)->cannotBeEmpty()->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('cart_price_rule_voucher_code_customer')
                            ->addDefaultsIfNotSet()
                                ->children()
                                    ->variableNode('options')->end()
                                    ->arrayNode('classes')
                                        ->addDefaultsIfNotSet()
                                        ->children()
                                            ->scalarNode('model')->defaultValue(CartPriceRuleVoucherCodeCustomer::class)->cannotBeEmpty()->end()
                                            ->scalarNode('interface')->defaultValue(CartPriceRuleVoucherCodeCustomerInterface::class)->cannotBeEmpty()->end()
                                            ->scalarNode('factory')->defaultValue(CartPriceRuleVoucherCodeCustomerFactory::class)->cannotBeEmpty()->end()
                                            ->scalarNode('repository')->defaultValue(CartPriceRuleVoucherCodeCustomerRepository::class)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
                ->arrayNode('pimcore')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->arrayNode('order')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->arrayNode('path')
                                    ->children()
                                        ->scalarNode('order')->defaultValue('orders')->end()
                                        ->scalarNode('quote')->defaultValue('quotes')->end()
                                        ->scalarNode('cart')->defaultValue('carts')->end()
                                    ->end()
                                ->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\CoreShopOrder')->cannotBeEmpty()->end()
                                        ->scalarNode('pimcore_class_name')->end()
                                        ->scalarNode('interface')->defaultValue(OrderInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->defaultValue(OrderRepository::class)->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/classes/CoreShopOrder.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT)->cannotBeOverwritten(true)->end()
                                        ->arrayNode('pimcore_controller')
                                            ->addDefaultsIfNotSet()
                                            ->children()
                                                ->scalarNode('default')->defaultValue(OrderController::class)->end()
                                                ->scalarNode('creation')->defaultValue(OrderCreationController::class)->end()
                                                ->scalarNode('edit')->defaultValue(OrderEditController::class)->end()
                                                ->scalarNode('payment')->defaultValue(OrderPaymentController::class)->end()
                                                ->scalarNode('comment')->defaultValue(OrderCommentController::class)->end()
                                                ->scalarNode('customer_creation')->defaultValue(CustomerCreationController::class)->end()
                                                ->scalarNode('address_creation')->defaultValue(AddressCreationController::class)->end()
                                            ->end()
                                        ->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('order_item')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->scalarNode('path')->defaultValue('items')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\CoreShopOrderItem')->cannotBeEmpty()->end()
                                        ->scalarNode('pimcore_class_name')->end()
                                        ->scalarNode('interface')->defaultValue(OrderItemInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->defaultValue(OrderItemRepository::class)->cannotBeEmpty()->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/classes/CoreShopOrderItem.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('order_invoice')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->scalarNode('path')->defaultValue('invoices')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\CoreShopOrderInvoice')->cannotBeEmpty()->end()
                                        ->scalarNode('pimcore_class_name')->end()
                                        ->scalarNode('interface')->defaultValue(OrderInvoiceInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->defaultValue(OrderInvoiceRepository::class)->end()
                                        ->scalarNode('pimcore_controller')->defaultValue(OrderInvoiceController::class)->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/classes/CoreShopOrderInvoice.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('order_invoice_item')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->scalarNode('path')->defaultValue('items')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\CoreShopOrderInvoiceItem')->cannotBeEmpty()->end()
                                        ->scalarNode('pimcore_class_name')->end()
                                        ->scalarNode('interface')->defaultValue(OrderInvoiceItemInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->cannotBeEmpty()->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/classes/CoreShopOrderInvoiceItem.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('order_shipment')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->scalarNode('path')->defaultValue('shipments')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\CoreShopOrderShipment')->cannotBeEmpty()->end()
                                        ->scalarNode('pimcore_class_name')->end()
                                        ->scalarNode('interface')->defaultValue(OrderShipmentInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->defaultValue(OrderShipmentRepository::class)->end()
                                        ->scalarNode('pimcore_controller')->defaultValue(OrderShipmentController::class)->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/classes/CoreShopOrderShipment.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('order_shipment_item')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->scalarNode('path')->defaultValue('items')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\CoreShopOrderShipmentItem')->cannotBeEmpty()->end()
                                        ->scalarNode('pimcore_class_name')->end()
                                        ->scalarNode('interface')->defaultValue(OrderShipmentItemInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->cannotBeEmpty()->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/classes/CoreShopOrderShipmentItem.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('cart_price_rule_item')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\Fieldcollection\Data\CoreShopProposalCartPriceRuleItem')->cannotBeEmpty()->end()
                                        ->scalarNode('interface')->defaultValue(ProposalCartPriceRuleItemInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->cannotBeEmpty()->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/fieldcollections/CoreShopProposalCartPriceRuleItem.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_FIELD_COLLECTION)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('price_rule_item')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\Fieldcollection\Data\CoreShopPriceRuleItem')->cannotBeEmpty()->end()
                                        ->scalarNode('interface')->defaultValue(PriceRuleItemInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->cannotBeEmpty()->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/fieldcollections/CoreShopPriceRuleItem.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_FIELD_COLLECTION)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('adjustment')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\Fieldcollection\Data\CoreShopAdjustment')->cannotBeEmpty()->end()
                                        ->scalarNode('interface')->defaultValue(AdjustmentInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->cannotBeEmpty()->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/fieldcollections/CoreShopAdjustment.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_FIELD_COLLECTION)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('order_item_attribute')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->variableNode('options')->end()
                                ->arrayNode('classes')
                                    ->addDefaultsIfNotSet()
                                    ->children()
                                        ->scalarNode('model')->defaultValue('Pimcore\Model\DataObject\Fieldcollection\Data\CoreShopOrderItemAttribute')->cannotBeEmpty()->end()
                                        ->scalarNode('interface')->defaultValue(OrderItemAttributeInterface::class)->cannotBeEmpty()->end()
                                        ->scalarNode('factory')->defaultValue(PimcoreFactory::class)->cannotBeEmpty()->end()
                                        ->scalarNode('repository')->cannotBeEmpty()->end()
                                        ->scalarNode('install_file')->defaultValue('@CoreShopOrderBundle/Resources/install/pimcore/fieldcollections/CoreShopOrderItemAttribute.json')->end()
                                        ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_FIELD_COLLECTION)->cannotBeOverwritten(true)->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                    ->end()
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
                    ->arrayNode('js')
                        ->useAttributeAsKey('name')
                        ->prototype('scalar')->end()
                    ->end()
                    ->arrayNode('css')
                        ->useAttributeAsKey('name')
                        ->prototype('scalar')->end()
                    ->end()
                    ->arrayNode('editmode_js')
                        ->useAttributeAsKey('name')
                        ->prototype('scalar')->end()
                    ->end()
                    ->arrayNode('editmode_css')
                        ->useAttributeAsKey('name')
                        ->prototype('scalar')->end()
                    ->end()
                    ->scalarNode('permissions')
                        ->cannotBeOverwritten()
                        ->defaultValue([
                            'cart_price_rule',
                            'order_list',
                            'order_detail',
                            'order_create',
                            'quote_list',
                            'quote_detail',
                            'quote_create',
                            'cart_list',
                            'cart_detail',
                            'cart_create',
                        ])
                    ->end()
                    ->arrayNode('install')
                        ->addDefaultsIfNotSet()
                        ->children()
                            ->arrayNode('grid_config')
                                ->treatNullLike([])
                                ->scalarPrototype()->end()
                                ->defaultValue(['@CoreShopOrderBundle/Resources/install/pimcore/grid-config.yml'])
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end()
        ->end()
        ;
    }
}
