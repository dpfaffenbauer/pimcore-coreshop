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

namespace CoreShop\Component\Store\Context;

use CoreShop\Component\Store\Model\StoreInterface;
use CoreShop\Component\Store\Repository\StoreRepositoryInterface;
use Pimcore\Model\Site;

class SiteBasedResolver implements SiteBasedResolverInterface
{
    public function __construct(
        private StoreRepositoryInterface $storeRepository,
    ) {
    }

    public function resolveSiteWithDefaultForStore(?Site $site): ?StoreInterface
    {
        if (null !== $site) {
            $store = $this->storeRepository->findOneBySite($site->getId());

            if ($store !== null) {
                return $store;
            }
        }

        $defaultStore = $this->storeRepository->findStandard();

        if ($defaultStore) {
            return $defaultStore;
        }

        return null;
    }
}