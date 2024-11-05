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

namespace CoreShop\Component\Store\Context\RequestBased;

use CoreShop\Component\Store\Context\StoreContextInterface;
use CoreShop\Component\Store\Context\StoreNotFoundException;
use CoreShop\Component\Store\Model\StoreInterface;

final class CachedStoreContext implements StoreContextInterface
{
    private bool $initialized = false;

    private ?StoreInterface $cachedStore = null;

    public function __construct(
        private StoreContextInterface $requestBasedStoreContext,
    ) {
    }

    public function getStore(): StoreInterface
    {
        if (false === $this->initialized) {
            $this->cachedStore = $this->requestBasedStoreContext->getStore();
            $this->initialized = true;
        } elseif (!$this->cachedStore) {
            throw new StoreNotFoundException();
        }

        return $this->cachedStore;
    }
}
