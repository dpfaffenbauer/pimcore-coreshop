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

use CoreShop\Component\Pimcore\PriorityQueue;
use CoreShop\Component\Store\Context\StoreNotFoundException;
use CoreShop\Component\Store\Model\StoreInterface;
use Symfony\Component\HttpFoundation\Request;

final class CompositeRequestResolver implements RequestResolverInterface
{
    private PriorityQueue $requestResolvers;

    public function __construct(
        ) {
        $this->requestResolvers = new PriorityQueue();
    }

    public function addResolver(RequestResolverInterface $requestResolver, int $priority = 0): void
    {
        $this->requestResolvers->insert($requestResolver, $priority);
    }

    public function findStore(Request $request): ?StoreInterface
    {
        foreach ($this->requestResolvers as $requestResolver) {
            try {
                return $requestResolver->findStore($request);
            } catch (StoreNotFoundException) {
                //Ignore and continue
            }
        }

        throw new StoreNotFoundException();
    }
}
