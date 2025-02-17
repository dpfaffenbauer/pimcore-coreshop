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

namespace CoreShop\Component\Registry;

class PriorityMap implements \Iterator, \Countable
{
    public const ORDER_ASC = 'asc';

    public const ORDER_DESC = 'desc';

    private int $lastSequence = 0;

    private array $list = [];

    private string $order = self::ORDER_ASC;

    /**
     * Get scalar key from mixed.
     */
    private function getScalarKey($key)
    {
        if (is_object($key)) {
            return spl_object_hash($key);
        }

        return $key;
    }

    /**
     * Add new item to map.
     *
     * @param string $key      name
     * @param mixed  $value    value
     * @param int    $priority priority
     *
     * @return \stdClass
     */
    public function set(string $key, mixed $value, int $priority = 0)
    {
        $key = $this->getScalarKey($key);
        $this->list[$key] = new \stdClass();
        $this->list[$key]->value = $value;
        $this->list[$key]->priority = $priority;
        $this->list[$key]->sequence = $this->lastSequence++;

        return $this->list[$key];
    }

    /**
     * Get item from map.
     *
     * @param string $key
     *
     * @return mixed
     */
    public function get($key)
    {
        $key = $this->getScalarKey($key);

        return isset($this->list[$key]) ? $this->list[$key]->value : null;
    }

    /**
     * Check if item in map.
     *
     * @param string $key
     *
     * @return bool
     */
    public function has($key)
    {
        $key = $this->getScalarKey($key);

        return isset($this->list[$key]);
    }

    /**
     * remove item in map.
     *
     * @param string $key
     */
    public function remove($key)
    {
        $key = $this->getScalarKey($key);

        if (isset($this->list[$key])) {
            unset($this->list[$key]);
        }
    }

    /**
     * Get list of keys.
     *
     * @return array<int, int|string>
     */
    public function getKeys()
    {
        uasort($this->list, [$this, $this->order . 'SortStrategy']);

        return array_keys($this->list);
    }

    /**
     * Get count or map.
     */
    public function count(): int
    {
        return count($this->list);
    }

    /**
     * Set ASC direction of sorting.
     *
     * @return $this
     */
    public function setAscOrder()
    {
        $this->order = self::ORDER_ASC;

        return $this;
    }

    /**
     * Set DESC direction of sorting.
     *
     * @return $this
     */
    public function setDescOrder()
    {
        $this->order = self::ORDER_DESC;

        return $this;
    }

    /**
     * ASC sort strategy.
     *
     * @param \stdClass $declaration1
     * @param \stdClass $declaration2
     *
     * @return int
     */
    private function ascSortStrategy($declaration1, $declaration2)
    {
        if ($declaration1->priority === $declaration2->priority) {
            return $declaration1->sequence < $declaration2->sequence ? 1 : -1;
        }

        return $declaration1->priority > $declaration2->priority ? 1 : -1;
    }

    /**
     * DESC sort strategy.
     *
     * @param \stdClass $declaration1
     * @param \stdClass $declaration2
     *
     * @return int
     */
    private function descSortStrategy($declaration1, $declaration2)
    {
        if ($declaration1->priority === $declaration2->priority) {
            return $declaration1->sequence < $declaration2->sequence ? 1 : -1;
        }

        return $declaration1->priority < $declaration2->priority ? 1 : -1;
    }

    /**
     * Reset iterator.
     */
    public function rewind(): void
    {
        uasort($this->list, [$this, $this->order . 'SortStrategy']);
        reset($this->list);
    }

    /**
     * Get current item.
     */
    public function current(): mixed
    {
        $item = current($this->list);

        /**
         * @psalm-suppress InvalidPropertyFetch
         */
        return $item->value;
    }

    /**
     * Get current key.
     */
    public function key(): mixed
    {
        return key($this->list);
    }

    /**
     * Mve iterator next.
     */
    public function next(): void
    {
        next($this->list);
    }

    /**
     * Check if current key is valid.
     */
    public function valid(): bool
    {
        return null !== $this->key();
    }

    /**
     * Convert map to array.
     *
     * @return array
     */
    public function toArray()
    {
        return iterator_to_array($this);
    }
}
