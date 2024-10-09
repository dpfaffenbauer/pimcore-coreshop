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

namespace CoreShop\Component\Core\Wishlist\Repository;

use CoreShop\Component\Customer\Model\CustomerInterface;
use CoreShop\Component\StorageList\Core\Repository\CustomerAndStoreAwareRepositoryInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use CoreShop\Component\Wishlist\Model\WishlistInterface;

interface WishlistRepositoryInterface extends
    \CoreShop\Component\Wishlist\Repository\WishlistRepositoryInterface,
    CustomerAndStoreAwareRepositoryInterface
{
    public function findLatestByStoreAndCustomer(StoreInterface $store, CustomerInterface $customer, string $name = null): ?WishlistInterface;
}
