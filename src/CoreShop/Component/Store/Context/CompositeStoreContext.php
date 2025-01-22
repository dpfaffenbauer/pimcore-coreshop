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
use CoreShop\Component\Pimcore\PriorityQueue;

final class CompositeStoreContext implements StoreContextInterface
{
    /**
     * @var PriorityQueue|StoreContextInterface[]
     *
     * @psalm-var PriorityQueue<StoreContextInterface>
     */
    private PriorityQueue $storeContexts;

    public function __construct(
        ) {
        $this->storeContexts = new PriorityQueue();
    }

    public function addContext(StoreContextInterface $storeContext, int $priority = 0): void
    {
        $this->storeContexts->insert($storeContext, $priority);
    }

    public function getStore(): StoreInterface
    {
        foreach ($this->storeContexts as $storeContext) {
            try {
                return $storeContext->getStore();
            } catch (StoreNotFoundException) {
                continue;
            }
        }

        throw new StoreNotFoundException();
    }
}
