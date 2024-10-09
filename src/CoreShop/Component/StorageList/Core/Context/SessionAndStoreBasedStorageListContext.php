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

namespace CoreShop\Component\StorageList\Core\Context;

use CoreShop\Component\StorageList\Context\StorageListContextInterface;
use CoreShop\Component\StorageList\Context\StorageListNotFoundException;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Storage\StorageListStorageInterface;
use CoreShop\Component\Store\Context\StoreContextInterface;
use CoreShop\Component\Store\Context\StoreNotFoundException;
use CoreShop\Component\Store\Model\StoreAwareInterface;

final class SessionAndStoreBasedStorageListContext implements StorageListContextInterface
{
    public function __construct(
        private StorageListStorageInterface $storageListStorage,
        private StoreContextInterface $storeContext,
    ) {
    }

    public function getStorageList(): StorageListInterface
    {
        try {
            $store = $this->storeContext->getStore();
        } catch (StoreNotFoundException $exception) {
            throw new StorageListNotFoundException($exception->getMessage(), $exception);
        }

        $context = [
            'store' => $this->storeContext->getStore(),
        ];

        if (!$this->storageListStorage->hasForContext($context)) {
            throw new StorageListNotFoundException('CoreShop was not able to find the List in session');
        }

        /**
         * @var StorageListInterface|null $storageList
         */
        $storageList = $this->storageListStorage->getForContext($context);

        if (!$storageList instanceof StoreAwareInterface) {
            throw new StorageListNotFoundException();
        }

        if (null === $storageList->getStore() || $storageList->getStore()->getId() !== $store->getId()) {
            $storageList = null;
        }

        if (null === $storageList) {
            $this->storageListStorage->removeForContext($context);

            throw new StorageListNotFoundException('CoreShop was not able to find the List in session');
        }

        return $storageList;
    }
}
