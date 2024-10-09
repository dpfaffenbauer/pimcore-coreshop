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

namespace CoreShop\Component\StorageList\Core\Provider;

use CoreShop\Component\Core\Context\ShopperContextInterface;
use CoreShop\Component\Currency\Model\CurrencyAwareInterface;
use CoreShop\Component\Customer\Context\CustomerNotFoundException;
use CoreShop\Component\Customer\Model\CustomerAwareInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Provider\ContextProviderInterface;
use CoreShop\Component\Store\Context\StoreNotFoundException;
use CoreShop\Component\Store\Model\StoreAwareInterface;

class CoreContextProvider implements ContextProviderInterface
{
    public function __construct(
        private ShopperContextInterface $shopperContext,
    ) {
    }

    public function provideContextForStorageList(StorageListInterface $storageList): void
    {
        if ($storageList instanceof StoreAwareInterface) {
            try {
                $store = $this->shopperContext->getStore();
                $storageList->setStore($store);
            } catch (StoreNotFoundException) {
            }
        }

        if ($storageList instanceof CurrencyAwareInterface) {
            $currency = $this->shopperContext->getCurrency();
            $storageList->setCurrency($currency);
        }

        if (($storageList instanceof CustomerAwareInterface) && $this->shopperContext->hasCustomer()) {
            $customer = $this->shopperContext->getCustomer();
            $storageList->setCustomer($customer);
        }
    }

    public function getCurrentContext(): array
    {
        return $this->shopperContext->getContext();
    }
}
