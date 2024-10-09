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

namespace CoreShop\Component\StorageList\Storage;

use CoreShop\Component\StorageList\Model\StorageListInterface;

class SimpleStorageListStorage implements StorageListStorageInterface
{
    private array $simple = [];

    public function hasForContext(array $context): bool
    {
        if (!isset($this->simple['coreshop.cart'])) {
            return false;
        }

        return array_key_exists('coreshop.cart', $this->simple);
    }

    public function getForContext(array $context): ?StorageListInterface
    {
        if (!isset($this->simple['coreshop.cart'])) {
            return null;
        }

        if ($this->hasForContext($context)) {
            return $this->simple['coreshop.cart'];
        }

        return null;
    }

    public function setForContext(array $context, StorageListInterface $storageList): void
    {
        $this->simple['coreshop.cart'] = $storageList;
    }

    public function removeForContext(array $context): void
    {
        unset($this->simple['coreshop.cart']);
    }
}