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

namespace CoreShop\Bundle\OrderBundle\Pimcore\Repository;

use Carbon\Carbon;
use CoreShop\Bundle\ResourceBundle\Pimcore\PimcoreRepository;
use CoreShop\Component\Customer\Model\CustomerInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\OrderPaymentStates;
use CoreShop\Component\Order\OrderSaleStates;
use CoreShop\Component\Order\OrderStates;
use CoreShop\Component\Order\Repository\OrderRepositoryInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\Store\Model\StoreInterface;

class OrderRepository extends PimcoreRepository implements OrderRepositoryInterface
{
    public function findLatestByStoreAndCustomer(
        StoreInterface $store,
        CustomerInterface $customer,
        ?string $name = null,
    ): ?StorageListInterface {
        return $this->findLatestCartByStoreAndCustomer($store, $customer);
    }

    public function findNamedStorageLists(StoreInterface $store, CustomerInterface $customer): array
    {
        $list = $this->getList();
        $list->setCondition('customer__id = ? AND store = ? AND saleState = ?', [$customer->getId(), $store->getId(), OrderSaleStates::STATE_CART]);
        $list->setOrderKey('id');
        $list->setOrder('ASC');
        $list->load();

        return $list->getObjects();
    }

    public function findCartByCustomer(CustomerInterface $customer): array
    {
        $list = $this->getList();
        $list->setCondition('customer__id = ? AND saleState = ?', [$customer->getId(), OrderSaleStates::STATE_CART]);
        $list->load();

        /**
         * @var OrderInterface[] $carts
         */
        $carts = $list->getObjects();

        return $carts;
    }

    public function findByStorageListId(int $id): ?StorageListInterface
    {
        return $this->findByCartId($id);
    }

    public function findByCartId(int $id): ?OrderInterface
    {
        $list = $this->getList();
        $list->setCondition('id = ? AND saleState = ? ', [$id, OrderSaleStates::STATE_CART]);
        $list->load();

        if ($list->getTotalCount() > 0) {
            $objects = $list->getObjects();

            return $objects[0];
        }

        return null;
    }

    public function findByToken(string $token): ?OrderInterface
    {
        $list = $this->getList();
        $list->setCondition('token = ?', [$token]);
        $list->load();

        if ($list->getTotalCount() === 1) {
            $objects = $list->getObjects();

            return $objects[0];
        }

        return null;
    }

    public function findLatestCartByStoreAndCustomer(StoreInterface $store, CustomerInterface $customer): ?OrderInterface
    {
        $list = $this->getList();
        $list->setCondition('customer__id = ? AND store = ? AND saleState = ? ', [$customer->getId(), $store->getId(), OrderSaleStates::STATE_CART]);
        $list->setOrderKey('creationDate');
        $list->setOrder('DESC');
        $list->load();

        $objects = $list->getObjects();

        if (count($objects) > 0 && $objects[0] instanceof OrderInterface) {
            return $objects[0];
        }

        return null;
    }

    public function findOrdersByCustomer(CustomerInterface $customer): array
    {
        $list = $this->getList();
        $list->setCondition('customer__id = ? AND saleState = ?', [$customer->getId(), OrderSaleStates::STATE_ORDER]);
        $list->setOrderKey('orderDate');
        $list->setOrder('DESC');
        $list->load();

        return $list->getObjects();
    }

    public function findExpiredCarts(int $days, bool $anonymous, bool $customer): array
    {
        $list = $this->getList();

        $conditions = [];
        $groupCondition = [];
        $params = [];

        $daysTimestamp = Carbon::now();
        $daysTimestamp->subDays($days);

        $conditions[] = 'creationDate < ?';
        $params[] = $daysTimestamp->getTimestamp();

        //Never delete carts with a order
        $conditions[] = 'saleState = ?';
        $params[] = OrderSaleStates::STATE_CART;

        if (true === $anonymous) {
            $groupCondition[] = 'customer__id IS NULL';
        }

        if (true === $customer) {
            $groupCondition[] = 'customer__id IS NOT NULL';
        }

        $bind = ' AND ';
        $groupBind = ' OR ';

        $sql = implode($bind, $conditions);

        if (count($groupCondition) > 1) {
            $groupBind = ' OR ';
        }

        $sql .= ' AND (' . implode($groupBind, $groupCondition) . ') ';

        $list->setCondition($sql, $params);

        /**
         * @var OrderInterface[] $result
         */
        $result = $list->getObjects();

        return $result;
    }

    public function findByCustomer(CustomerInterface $customer): array
    {
        $list = $this->getList();
        $list->setCondition('customer__id = ?', [$customer->getId()]);
        $list->setOrderKey('id');
        $list->setOrder('DESC');
        $list->load();

        return $list->getObjects();
    }

    public function hasCustomerOrders(CustomerInterface $customer): bool
    {
        $list = $this->getList();
        $list->setCondition('customer__id = ?', [$customer->getId()]);

        return $list->getTotalCount() > 0;
    }

    public function findExpiredOrders(int $days): array
    {
        $daysTimestamp = Carbon::now();
        $daysTimestamp->subDays($days);

        $conditions = ['IFNULL(orderDate,creationDate) < ? AND saleState = ? AND orderState IN (?, ?, ?) AND paymentState <> ?'];
        $params = [];
        $params[] = $daysTimestamp->getTimestamp();
        $params[] = OrderSaleStates::STATE_ORDER;
        $params[] = OrderStates::STATE_NEW;
        $params[] = OrderStates::STATE_CONFIRMED;
        $params[] = OrderStates::STATE_INITIALIZED;
        $params[] = OrderPaymentStates::STATE_PAID;

        $bind = ' AND ';

        $sql = implode($bind, $conditions);

        $list = $this->getList();
        $list->setCondition($sql, $params);

        /**
         * @var OrderInterface[] $result
         */
        $result = $list->getObjects();

        return $result;
    }
}
