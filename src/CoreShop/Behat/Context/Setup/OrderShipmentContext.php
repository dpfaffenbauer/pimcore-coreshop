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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Bundle\WorkflowBundle\Applier\StateMachineApplier;
use CoreShop\Component\Core\Model\OrderInterface;
use CoreShop\Component\Core\Model\OrderShipmentInterface;
use CoreShop\Component\Order\ShipmentTransitions;
use CoreShop\Component\Order\Transformer\OrderDocumentTransformerInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;

final class OrderShipmentContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private OrderDocumentTransformerInterface $shipmentTransformer,
        private FactoryInterface $orderShipmentFactory,
        private StateMachineApplier $stateMachineApplier,
    ) {
    }

    /**
     * @Given /^I create a shipment for (my order)$/
     * @Given /^I create another shipment for (my order)$/
     */
    public function iCreateAFullShipmentForOrder(OrderInterface $order): void
    {
        $items = $order->getItems();
        $orderItem = reset($items);

        $orderShipment = $this->orderShipmentFactory->createNew();
        $orderShipment = $this->shipmentTransformer->transform($order, $orderShipment, [
            [
                'orderItemId' => $orderItem->getId(),
                'quantity' => 1,
            ],
        ]);

        $this->sharedStorage->set('orderShipment', $orderShipment);
    }

    /**
     * @Given /^I apply shipment transition "([^"]+)" to (latest order shipment)$/
     */
    public function iApplyShipmentTransitionToShipment($shipmentTransition, OrderShipmentInterface $shipment): void
    {
        $this->stateMachineApplier->apply($shipment, ShipmentTransitions::IDENTIFIER, $shipmentTransition);
    }
}
