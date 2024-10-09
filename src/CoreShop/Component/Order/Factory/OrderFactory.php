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

namespace CoreShop\Component\Order\Factory;

use CoreShop\Component\Order\OrderInvoiceStates;
use CoreShop\Component\Order\OrderPaymentStates;
use CoreShop\Component\Order\OrderSaleStates;
use CoreShop\Component\Order\OrderShipmentStates;
use CoreShop\Component\Order\OrderStates;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Resource\TokenGenerator\UniqueTokenGenerator;
use CoreShop\Component\StorageList\Factory\StorageListFactoryInterface;
use CoreShop\Component\StorageList\Model\NameableStorageListInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;

class OrderFactory implements StorageListFactoryInterface
{
    public function __construct(
        private FactoryInterface $cartFactory,
        private UniqueTokenGenerator $tokenGenerator,
        private int $tokenLength = 10,
    ) {
    }

    public function createNew()
    {
        $cart = $this->cartFactory->createNew();
        $cart->setKey(uniqid('cart', true));
        $cart->setPublished(true);
        $cart->setToken($this->tokenGenerator->generate($this->tokenLength));
        $cart->setSaleState(OrderSaleStates::STATE_CART);
        $cart->setOrderState(OrderStates::STATE_INITIALIZED);
        $cart->setShippingState(OrderShipmentStates::STATE_NEW);
        $cart->setPaymentState(OrderPaymentStates::STATE_NEW);
        $cart->setInvoiceState(OrderInvoiceStates::STATE_NEW);

        return $cart;
    }

    public function createNewNamed(string $name)
    {
        /**
         * @var StorageListInterface $storageList
         */
        $storageList = $this->createNew();

        if ($storageList instanceof NameableStorageListInterface) {
            $storageList->setName($name);
        }

        return $storageList;
    }
}
