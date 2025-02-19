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

namespace CoreShop\Bundle\IndexBundle\Order\Mysql;

use CoreShop\Bundle\IndexBundle\Worker\MysqlWorker;
use CoreShop\Component\Index\Order\OrderInterface;
use CoreShop\Component\Index\Order\SimpleOrder;
use CoreShop\Component\Index\Worker\WorkerInterface;
use Webmozart\Assert\Assert;

class SimpleOrderRenderer extends AbstractMysqlDynamicRenderer
{
    public function render(WorkerInterface $worker, OrderInterface $order, ?string $prefix = null): string
    {
        /**
         * @var SimpleOrder $order
         */
        Assert::isInstanceOf($order, SimpleOrder::class);

        return '' . $this->quoteFieldName($order->getKey(), $prefix) . ' ' . $order->getDirection();
    }

    public function supports(WorkerInterface $worker, OrderInterface $order): bool
    {
        return $worker instanceof MysqlWorker && $order instanceof SimpleOrder;
    }
}
