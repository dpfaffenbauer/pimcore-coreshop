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
use CoreShop\Component\Order\InvoiceTransitions;
use CoreShop\Component\Order\Model\OrderInvoiceInterface;
use CoreShop\Component\Order\Transformer\OrderDocumentTransformerInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;

final class OrderInvoiceContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private OrderDocumentTransformerInterface $invoiceTransformer,
        private FactoryInterface $orderInvoiceFactory,
        private StateMachineApplier $stateMachineApplier,
    ) {
    }

    /**
     * @Given /^I create a invoice for (my order)$/
     * @Given /^I create another invoice for (my order)$/
     */
    public function iCreateAInvoiceForOrder(OrderInterface $order): void
    {
        $items = $order->getItems();
        $orderItem = reset($items);

        $orderInvoice = $this->orderInvoiceFactory->createNew();
        $orderInvoice = $this->invoiceTransformer->transform($order, $orderInvoice, [
            [
                'orderItemId' => $orderItem->getId(),
                'quantity' => 1,
            ],
        ]);

        $this->sharedStorage->set('orderInvoice', $orderInvoice);
    }

    /**
     * @Given /^I apply invoice transition "([^"]+)" to (latest order invoice)$/
     */
    public function iApplyInvoiceTransitionToInvoice($invoiceTransition, OrderInvoiceInterface $invoice): void
    {
        $this->stateMachineApplier->apply($invoice, InvoiceTransitions::IDENTIFIER, $invoiceTransition);
    }
}
