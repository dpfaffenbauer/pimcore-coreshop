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

namespace CoreShop\Bundle\PayumBundle\Extension;

use CoreShop\Bundle\PayumBundle\Request\GetStatus;
use CoreShop\Bundle\WorkflowBundle\Manager\StateMachineManager;
use CoreShop\Component\Core\Model\PaymentInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\OrderTransitions;
use Payum\Core\Extension\Context;
use Payum\Core\Extension\ExtensionInterface;
use Payum\Core\Request\Generic;
use Payum\Core\Request\Notify;

final class UpdateOrderStateExtension implements ExtensionInterface
{
    public function __construct(
        private StateMachineManager $stateMachineManager,
    ) {
    }

    public function onPreExecute(Context $context): void
    {
    }

    public function onExecute(Context $context): void
    {
    }

    public function onPostExecute(Context $context): void
    {
        if ($context->getException()) {
            return;
        }

        $previousStack = $context->getPrevious();
        /**
         * @var int
         *
         * @psalm-type int
         */
        $previousStackSize = count($previousStack);

        if ($previousStackSize > 1) {
            return;
        }

        if ($previousStackSize === 1) {
            $previousActionClassName = $previousStack[0]->getAction()::class;
            if (false === stripos($previousActionClassName, 'NotifyNullAction')) {
                return;
            }
        }

        /** @var Generic|bool $request */
        $request = $context->getRequest();
        if (false === $request instanceof Generic) {
            return;
        }

        if (false === $request instanceof Notify) {
            return;
        }

        /** @var PaymentInterface|bool $payment */
        $payment = $request->getFirstModel();
        if (false === $payment instanceof PaymentInterface) {
            return;
        }

        $context->getGateway()->execute($status = new GetStatus($payment));
        $value = $status->getValue();

        if ($value === $payment->getState()) {
            return;
        }

        if ($value === PaymentInterface::STATE_COMPLETED ||
            $value === PaymentInterface::STATE_AUTHORIZED
        ) {
            $order = $payment->getOrder();
            $this->confirmOrderState($order);
        }
    }

    private function confirmOrderState(OrderInterface $order): void
    {
        $stateMachine = $this->stateMachineManager->get($order, 'coreshop_order');
        if ($stateMachine->can($order, OrderTransitions::TRANSITION_CONFIRM)) {
            $stateMachine->apply($order, OrderTransitions::TRANSITION_CONFIRM);
        }
    }
}
