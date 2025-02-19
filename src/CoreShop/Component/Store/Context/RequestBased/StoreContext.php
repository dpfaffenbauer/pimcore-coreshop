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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

final class StoreContext implements StoreContextInterface
{
    public function __construct(
        private RequestResolverInterface $requestResolver,
        private RequestStack $requestStack,
    ) {
    }

    public function getStore(): StoreInterface
    {
        try {
            return $this->getStoreForRequest($this->getMainRequest());
        } catch (\UnexpectedValueException $exception) {
            throw new StoreNotFoundException($exception);
        }
    }

    private function getStoreForRequest(Request $request): StoreInterface
    {
        $store = $this->requestResolver->findStore($request);

        $this->assertStoreWasFound($store);

        return $store;
    }

    private function getMainRequest(): Request
    {
        $masterRequest = $this->requestStack->getMainRequest();
        if (null === $masterRequest) {
            throw new \UnexpectedValueException('There are not any requests on request stack');
        }

        return $masterRequest;
    }

    private function assertStoreWasFound(?StoreInterface $store = null): void
    {
        if (null === $store) {
            throw new \UnexpectedValueException('Store was not found for given request');
        }
    }
}
