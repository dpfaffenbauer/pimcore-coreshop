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

namespace CoreShop\Component\StorageList\Core\Repository;

use CoreShop\Component\Customer\Model\CustomerInterface;
use CoreShop\Component\Resource\Repository\PimcoreRepositoryInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\Store\Model\StoreInterface;

interface CustomerAndStoreAwareRepositoryInterface extends PimcoreRepositoryInterface
{
    public function findLatestByStoreAndCustomer(StoreInterface $store, CustomerInterface $customer, string $name = null): ?StorageListInterface;

    /**
     * @return StorageListInterface[]
     */
    public function findNamedStorageLists(StoreInterface $store, CustomerInterface $customer): array;
}
