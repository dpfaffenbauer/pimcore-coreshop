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
use Pimcore\Http\RequestHelper;
use Pimcore\Model\Document;
use Pimcore\Model\Document\Service;
use Pimcore\Model\Site;
use Symfony\Component\HttpFoundation\Request;

final class PimcoreAdminSiteBasedRequestResolver implements RequestResolverInterface
{
    public function __construct(
        private SiteBasedResolverInterface $siteBasedResolver,
        private RequestHelper $requestHelper,
        private Service $documentService,
    ) {
    }

    public function findStore(Request $request): ?StoreInterface
    {
        $document = null;

        if ($request->attributes->get('_route') === 'pimcore_admin_document_page_save') {
            $id = $request->request->get('id');

            if ($id) {
                $document = Document::getById((int) $id);
            }
        } elseif ($this->requestHelper->isFrontendRequestByAdmin($request)) {
            /** @psalm-suppress InternalMethod */
            $document = $this->documentService->getNearestDocumentByPath($request->getPathInfo());
        } else {
            throw new StoreNotFoundException();
        }

        if ($document instanceof Document) {
            do {
                try {
                    $site = Site::getByRootId($document->getId());

                    $store = $this->siteBasedResolver->resolveSiteWithDefaultForStore($site);

                    if (null === $store) {
                        throw new StoreNotFoundException();
                    }

                    return $store;
                } catch (\Exception) {
                    //Ignore Exception and continue
                }

                $document = $document->getParent();
            } while ($document instanceof Document);
        }

        throw new StoreNotFoundException();
    }
}
