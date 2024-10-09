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

namespace CoreShop\Component\Wishlist\Model;

use CoreShop\Component\Resource\Pimcore\Model\PimcoreModelInterface;
use CoreShop\Component\StorageList\Model\NameableStorageListInterface;
use CoreShop\Component\StorageList\Model\ShareableStorageListInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Model\TokenAwareStorageListInterface;

interface WishlistInterface extends
    PimcoreModelInterface,
    StorageListInterface,
    TokenAwareStorageListInterface,
    ShareableStorageListInterface,
    NameableStorageListInterface
{
    /**
     * @return WishlistItemInterface[]|null
     */
    public function getItems(): ?array;

    /**
     * @param WishlistItemInterface[] $items
     */
    public function setItems(?array $items);

    public function hasItems(): bool;

    /**
     * @param WishlistItemInterface $item
     */
    public function addItem($item): void;

    /**
     * @param WishlistItemInterface $item
     */
    public function removeItem($item): void;

    /**
     * @param WishlistItemInterface $item
     */
    public function hasItem($item): bool;
}
