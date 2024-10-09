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

namespace CoreShop\Component\Pimcore\BatchProcessing;

use Countable;
use Iterator;
use Pimcore\Model\DataObject;

final class DataObjectBatchListing implements Iterator, Countable
{
    private int $index = 0;

    private int $loop = 0;

    private int $currentLoopLoaded = -1;

    private int $total = 0;

    private array $items = [];

    private ?array $ids = null;

    public function __construct(
        private DataObject\Listing $list,
        private int $batchSize,
    ) {
    }

    public function current(): DataObject
    {
        return $this->items[$this->index];
    }

    public function next(): void
    {
        ++$this->index;

        if ($this->index >= $this->batchSize) {
            $this->index = 0;
            ++$this->loop;

            $this->load();
        }
    }

    public function key(): int
    {
        return ($this->loop * $this->batchSize) + ($this->index + 1);
    }

    public function valid(): bool
    {
        return isset($this->items[$this->index]);
    }

    public function rewind(): void
    {
        $this->index = 0;
        $this->loop = 0;
        $this->currentLoopLoaded = -1;

        $this->load();
    }

    public function count(): int
    {
        if (!$this->total) {
            $dao = $this->list->getDao();

            if (!method_exists($dao, 'getCount')) {
                throw new \InvalidArgumentException(sprintf(
                    '%s listing class does not support count.',
                    $this->list::class,
                ));
            }

            /** @psalm-suppress InternalMethod */
            $this->total = $dao->getCount();
        }

        return $this->total;
    }

    /**
     * Load all items based on current state.
     */
    private function load(): void
    {
        if (null === $this->ids) {
            $dao = $this->list->getDao();

            if (!method_exists($dao, 'loadIdList')) {
                throw new \InvalidArgumentException(
                    sprintf(
                        '%s listing class does not support loadIdList.',
                        $this->list::class,
                    ),
                );
            }

            /** @psalm-suppress InternalMethod */
            $this->ids = $dao->loadIdList();
        }

        if ($this->currentLoopLoaded !== $this->loop) {
            $items = [];

            for ($i = 0; $i < $this->batchSize; ++$i) {
                $idOffset = ($this->loop * $this->batchSize) + $i;

                if (!array_key_exists($idOffset, $this->ids)) {
                    break;
                }

                $itemId = $this->ids[$idOffset];

                $items[$i] = DataObject::getById($itemId);
            }

            $this->items = $items;
            $this->currentLoopLoaded = $this->loop;
        }
    }
}
