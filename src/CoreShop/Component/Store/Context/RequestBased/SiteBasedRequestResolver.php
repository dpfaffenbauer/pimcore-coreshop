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

use CoreShop\Component\Store\Context\SiteBasedResolverInterface;
use CoreShop\Component\Store\Context\StoreNotFoundException;
use CoreShop\Component\Store\Model\StoreInterface;
use Pimcore\Model\Site;
use Symfony\Component\HttpFoundation\Request;

final class SiteBasedRequestResolver implements RequestResolverInterface
{
    public function __construct(
        private SiteBasedResolverInterface $siteBasedResolver,
    ) {
    }

    public function findStore(Request $request): ?StoreInterface
    {
        $store = $this->siteBasedResolver->resolveSiteWithDefaultForStore(Site::isSiteRequest() ? Site::getCurrentSite() : null);

        if ($store) {
            return $store;
        }

        throw new StoreNotFoundException();
    }
}
