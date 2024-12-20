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
use CoreShop\Component\Store\Repository\StoreRepositoryInterface;
use Pimcore\Model\Document;
use Pimcore\Model\Site;
use Pimcore\Tool\Frontend;
use Symfony\Component\HttpFoundation\Request;

final class PimcoreAreaBrickRenderResolver implements RequestResolverInterface
{
    public function __construct(
        private SiteBasedResolverInterface $siteBasedResolver,
    ) {
    }

    public function findStore(Request $request): ?StoreInterface
    {
        if ($request->attributes->get('_route') === 'pimcore_admin_document_page_areabrick-render-index-editmode') {
            $documentId = $request->request->get('documentId');

            if ($documentId) {
                $document = Document::getById((int) $documentId);

                if ($document) {
                    $site = Frontend::getSiteForDocument($document);

                    $store = $this->siteBasedResolver->resolveSiteWithDefaultForStore($site);

                    if (null === $store) {
                        throw new StoreNotFoundException();
                    }

                    return $store;
                }
            }
        }

        throw new StoreNotFoundException();
    }
}
