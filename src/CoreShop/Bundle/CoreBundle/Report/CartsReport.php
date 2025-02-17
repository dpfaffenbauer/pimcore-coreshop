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

namespace CoreShop\Bundle\CoreBundle\Report;

use Carbon\Carbon;
use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Core\Portlet\PortletInterface;
use CoreShop\Component\Core\Report\ReportInterface;
use CoreShop\Component\Order\OrderSaleStates;
use CoreShop\Component\Resource\Repository\PimcoreRepositoryInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\ParameterBag;

class CartsReport implements ReportInterface, PortletInterface
{
    private int $totalRecords = 0;

    public function __construct(
        private RepositoryInterface $storeRepository,
        private Connection $db,
        private PimcoreRepositoryInterface $orderRepository,
    ) {
    }

    public function getReportData(ParameterBag $parameterBag): array
    {
        return $this->getData($parameterBag);
    }

    public function getPortletData(ParameterBag $parameterBag): array
    {
        return $this->getData($parameterBag);
    }

    protected function getData(ParameterBag $parameterBag): array
    {
        $fromFilter = $parameterBag->get('from', (string) strtotime(date('01-m-Y')));
        $toFilter = $parameterBag->get('to', (string) strtotime(date('t-m-Y')));
        $storeId = $parameterBag->get('store', null);

        $from = Carbon::createFromTimestamp($fromFilter);
        $to = Carbon::createFromTimestamp($toFilter);

        $fromTimestamp = $from->getTimestamp();
        $toTimestamp = $to->getTimestamp();

        $orderClassId = $this->orderRepository->getClassId();

        if ($storeId === null) {
            return [];
        }

        $store = $this->storeRepository->find($storeId);

        if (!$store instanceof StoreInterface) {
            return [];
        }

        $queries = [];
        foreach (['LEFT', 'RIGHT'] as $join) {
            $queries[] = "
                SELECT
                    CASE WHEN orderDateTimestamp IS NULL THEN cartDateTimestamp ELSE orderDateTimestamp END as timestamp,
                    CASE WHEN orderCount IS NULL THEN 0 ELSE orderCount END as orders,
                    CASE WHEN cartCount IS NULL THEN 0 ELSE cartCount END as carts
                FROM (
                  SELECT 
                    COUNT(*) as orderCount,
                    DATE(FROM_UNIXTIME(orderDate)) as orderDateTimestamp
                  FROM object_query_$orderClassId AS orders
                  WHERE store = $storeId AND orderDate > $fromTimestamp AND orderDate < $toTimestamp and orders.saleState = '" . OrderSaleStates::STATE_ORDER . "'
                  GROUP BY DATE(FROM_UNIXTIME(orderDate))
                ) as ordersQuery
                $join OUTER JOIN (
                  SELECT
                    COUNT(*) as cartCount,
                    DATE(FROM_UNIXTIME(creationDate)) as cartDateTimestamp
                  FROM object_$orderClassId AS carts
                  WHERE store = $storeId AND creationDate > $fromTimestamp AND creationDate < $toTimestamp and carts.saleState = '" . OrderSaleStates::STATE_CART . "'
                  GROUP BY DATE(FROM_UNIXTIME(creationDate))
                ) as cartsQuery ON cartsQuery.cartDateTimestamp = ordersQuery.orderDateTimestamp
            ";
        }

        $data = $this->db->fetchAllAssociative(implode(\PHP_EOL . 'UNION ALL' . \PHP_EOL, $queries) . '  ORDER BY timestamp ASC');

        foreach ($data as &$day) {
            $date = Carbon::createFromTimestamp((string) strtotime($day['timestamp']));

            $day['datetext'] = $date->toDateString();
        }

        return $data;
    }

    public function getTotal(): int
    {
        return $this->totalRecords;
    }
}
