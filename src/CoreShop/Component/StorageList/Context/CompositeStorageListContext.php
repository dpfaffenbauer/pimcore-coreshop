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

namespace CoreShop\Component\StorageList\Context;

use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\Pimcore\PriorityQueue;

class CompositeStorageListContext implements StorageListContextInterface
{
    /**
     * @var PriorityQueue|StorageListContextInterface[]
     *
     * @psalm-var PriorityQueue<StorageListContextInterface>
     */
    protected PriorityQueue $contexts;

    public function __construct(
        ) {
        $this->contexts = new PriorityQueue();
    }

    public function addContext(StorageListContextInterface $context, int $priority = 0): void
    {
        $this->contexts->insert($context, $priority);
    }

    public function getStorageList(): StorageListInterface
    {
        foreach ($this->contexts as $context) {
            try {
                return $context->getStorageList();
            } catch (StorageListNotFoundException) {
                continue;
            }
        }

        throw new StorageListNotFoundException();
    }
}
