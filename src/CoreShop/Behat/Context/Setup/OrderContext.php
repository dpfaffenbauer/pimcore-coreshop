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
use CoreShop\Component\Order\OrderInvoiceTransitions;
use CoreShop\Component\Order\OrderSaleTransitions;
use CoreShop\Component\Order\OrderShipmentTransitions;
use CoreShop\Component\Order\OrderTransitions;
use CoreShop\Component\Payment\Model\PaymentInterface;
use CoreShop\Component\Payment\PaymentTransitions;
use CoreShop\Component\Store\Context\StoreContextInterface;

final class OrderContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private StoreContextInterface $storeContext,
        private StateMachineApplier $stateMachineApplier,
    ) {
    }

    /**
     * @Given /^I create an order from (my cart)$/
     */
    public function transformCartToOrder(OrderInterface $cart): void
    {
        $cart->setStore($this->storeContext->getStore());

        $this->stateMachineApplier->apply($cart, OrderSaleTransitions::IDENTIFIER, OrderSaleTransitions::TRANSITION_ORDER);

        $this->sharedStorage->set('order', $cart);
    }

    /**
     * @Given /^I apply payment transition "([^"]+)" to (latest order payment)$/
     */
    public function iApplyPaymentStateToLatestOrderPayment($paymentTransition, PaymentInterface $payment): void
    {
        $this->stateMachineApplier->apply($payment, PaymentTransitions::IDENTIFIER, $paymentTransition);
    }

    /**
     * @Given /^I apply transition "([^"]+)" to (my order)$/
     */
    public function iApplyTransitionToOrder($transition, OrderInterface $order): void
    {
        $this->stateMachineApplier->apply($order, OrderTransitions::IDENTIFIER, $transition);
    }

    /**
     * @Given /^I apply order invoice transition "([^"]+)" to (my order)$/
     */
    public function iApplyTransitionToOrderInvoice($transition, OrderInterface $order): void
    {
        $this->stateMachineApplier->apply($order, OrderInvoiceTransitions::IDENTIFIER, $transition);
    }

    /**
     * @Given /^I apply order shipment transition "([^"]+)" to (my order)$/
     */
    public function iApplyTransitionToOrderShipment($transition, OrderInterface $order): void
    {
        $this->stateMachineApplier->apply($order, OrderShipmentTransitions::IDENTIFIER, $transition);
    }
}
