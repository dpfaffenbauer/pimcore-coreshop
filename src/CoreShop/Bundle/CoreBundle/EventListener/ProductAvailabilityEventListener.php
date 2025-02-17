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

namespace CoreShop\Bundle\CoreBundle\EventListener;

use CoreShop\Component\Core\Model\OrderInterface;
use CoreShop\Component\Core\Model\OrderItemInterface;
use CoreShop\Component\Order\Model\PurchasableInterface;
use CoreShop\Component\Order\OrderSaleStates;
use CoreShop\Component\Order\Repository\OrderItemRepositoryInterface;
use CoreShop\Component\Pimcore\DataObject\VersionHelper;
use Doctrine\DBAL\Connection;
use Pimcore\Event\Model\DataObjectEvent;
use Pimcore\Model\DataObject\Concrete;

final class ProductAvailabilityEventListener
{
    private array $productIdsToCheck = [];

    public function __construct(
        private OrderItemRepositoryInterface $cartItemRepository,
        private Connection $db,
    ) {
    }

    public function preUpdateListener(DataObjectEvent $event): void
    {
        $object = $event->getObject();

        if ($event->hasArgument('isRecycleBinRestore') && $event->getArgument('isRecycleBinRestore')) {
            return;
        }

        if (!$object instanceof PurchasableInterface) {
            return;
        }

        if (!$object instanceof Concrete) {
            return;
        }

        if (in_array($object->getId(), $this->productIdsToCheck, true)) {
            return;
        }

        $originalPublished = (bool)$this->db->fetchOne('SELECT published FROM objects WHERE id=?', [$object->getId()]);
        if ($object->getPublished() === $originalPublished) {
            return;
        }

        $this->productIdsToCheck[$object->getId()] = $object->getId();
    }

    public function postUpdateListener(DataObjectEvent $event): void
    {
        $object = $event->getObject();

        if (!$object instanceof PurchasableInterface) {
            return;
        }

        if (!in_array($object->getId(), $this->productIdsToCheck, true)) {
            return;
        }

        unset($this->productIdsToCheck[$object->getId()]);

        $cartItems = $this->cartItemRepository->findOrderItemsByProductId($object->getId());

        if (count($cartItems) === 0) {
            return;
        }

        $this->informCarts($cartItems);
    }

    public function postDeleteListener(DataObjectEvent $event): void
    {
        $object = $event->getObject();

        if (!$object instanceof PurchasableInterface) {
            return;
        }

        $cartItems = $this->cartItemRepository->findOrderItemsByProductId($object->getId());

        if (count($cartItems) === 0) {
            return;
        }

        $this->informCarts($cartItems);
    }

    private function informCarts(array $cartItems): void
    {
        /** @var OrderItemInterface $cartItem */
        foreach ($cartItems as $cartItem) {
            $cart = $cartItem->getOrder();
            if (!$cart instanceof OrderInterface) {
                continue;
            }

            if ($cart->getSaleState() !== OrderSaleStates::STATE_CART) {
                continue;
            }

            $cart->removeItem($cartItem);
            $cartItem->delete();

            VersionHelper::useVersioning(
                function () use ($cart) {
                    $cart->setNeedsRecalculation(true);
                    $cart->save();
                },
                false,
            );
        }
    }
}
