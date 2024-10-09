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

namespace CoreShop\Bundle\OrderBundle\StateResolver;

use CoreShop\Bundle\WorkflowBundle\Manager\StateMachineManager;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\OrderInvoiceStates;
use CoreShop\Component\Order\OrderPaymentStates;
use CoreShop\Component\Order\OrderShipmentStates;
use CoreShop\Component\Order\OrderTransitions;
use CoreShop\Component\Order\StateResolver\StateResolverInterface;

final class OrderStateResolver implements StateResolverInterface
{
    public function __construct(
        private StateMachineManager $stateMachineManager,
        private bool $includeInvoiceStateToComplete,
    ) {
    }

    public function resolve(OrderInterface $order): void
    {
        $stateMachine = $this->stateMachineManager->get($order, 'coreshop_order');

        if ($this->canOrderBeConfirmed($order) && $stateMachine->can($order, OrderTransitions::TRANSITION_CONFIRM)) {
            $stateMachine->apply($order, OrderTransitions::TRANSITION_CONFIRM);
        }

        if ($this->canOrderBeComplete($order) && $stateMachine->can($order, OrderTransitions::TRANSITION_COMPLETE)) {
            $stateMachine->apply($order, OrderTransitions::TRANSITION_COMPLETE);
        }
    }

    private function canOrderBeConfirmed(OrderInterface $order): bool
    {
        return in_array($order->getPaymentState(), [
            OrderPaymentStates::STATE_PAID,
            OrderPaymentStates::STATE_PARTIALLY_PAID,
            OrderPaymentStates::STATE_AUTHORIZED,
            OrderPaymentStates::STATE_PARTIALLY_AUTHORIZED,
        ], true);
    }

    private function canOrderBeComplete(OrderInterface $order): bool
    {
        $coreStates = OrderPaymentStates::STATE_PAID === $order->getPaymentState() &&
            OrderShipmentStates::STATE_SHIPPED === $order->getShippingState();

        if ($this->includeInvoiceStateToComplete === true) {
            return $coreStates === true && OrderInvoiceStates::STATE_INVOICED === $order->getInvoiceState();
        }

        return $coreStates === true;
    }
}
