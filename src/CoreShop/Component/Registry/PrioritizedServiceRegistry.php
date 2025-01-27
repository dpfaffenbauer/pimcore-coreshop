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

final class PrioritizedServiceRegistry implements PrioritizedServiceRegistryInterface
{
    private PriorityMap $priortyMap;

    public function __construct(
        private string $interface,
        private string $context = 'service',
    ) {
        $this->priortyMap = new PriorityMap();
    }

    public function all(): array
    {
        return $this->priortyMap->toArray();
    }

    public function register(string $identifier, int $priority, object $service): void
    {
        if ($this->has($identifier)) {
            throw new ExistingServiceException($this->context, $identifier);
        }

        if (!in_array($this->interface, class_implements($service) ?: [], true)) {
            throw new \InvalidArgumentException(
                sprintf('%s needs to implement "%s", "%s" given.', ucfirst($this->context), $this->interface, $service::class),
            );
        }

        $this->priortyMap->set($identifier, $service, $priority);
    }

    public function unregister(string $identifier): void
    {
        if (!$this->has($identifier)) {
            throw new NonExistingServiceException($this->context, $identifier, $this->priortyMap->getKeys());
        }

        $this->priortyMap->remove($identifier);
    }

    public function has(string $identifier): bool
    {
        return $this->priortyMap->has($identifier);
    }

    public function get(string $identifier): object
    {
        if (!$this->has($identifier)) {
            throw new NonExistingServiceException($this->context, $identifier, $this->priortyMap->getKeys());
        }

        return $this->priortyMap->get($identifier);
    }

    public function getNextTo(string $identifier): ?object
    {
        $keys = $this->priortyMap->getKeys();
        $nextIndex = -1;

        foreach ($keys as $index => $key) {
            if ($key === $identifier) {
                $nextIndex = $index + 1;

                break;
            }
        }

        if (count($keys) > $nextIndex) {
            return $this->get($keys[$nextIndex]);
        }

        return null;
    }

    public function hasNextTo(string $identifier): bool
    {
        $keys = $this->priortyMap->getKeys();
        $nextIndex = -1;

        foreach ($keys as $index => $key) {
            if ($key === $identifier) {
                $nextIndex = $index + 1;

                break;
            }
        }

        if (!isset($keys[$nextIndex])) {
            return false;
        }

        return $this->has($keys[$nextIndex]);
    }

    private function getPreviousIndex(string $identifier): int
    {
        $keys = $this->priortyMap->getKeys();
        $prevIndex = -1;

        foreach ($keys as $index => $key) {
            if ($key == $identifier) {
                $prevIndex = $index - 1;

                break;
            }
        }

        return $prevIndex >= 0 ? $prevIndex : -1;
    }

    public function getPreviousTo(string $identifier): ?object
    {
        $keys = $this->priortyMap->getKeys();
        $prevIndex = $this->getPreviousIndex($identifier);

        if ($prevIndex >= 0) {
            return $this->get($keys[$prevIndex]);
        }

        return null;
    }

    public function hasPreviousTo(string $identifier): bool
    {
        $prevIndex = $this->getPreviousIndex($identifier);

        return $prevIndex >= 0;
    }

    public function getAllPreviousTo(string $identifier): array
    {
        $keys = $this->priortyMap->getKeys();
        $prevIndex = $this->getPreviousIndex($identifier);

        if ($prevIndex >= 0) {
            $previousElements = [];

            for ($i = $prevIndex; $i > 0; --$i) {
                $previousElements[] = $this->get($keys[$i]);
            }

            return $previousElements;
        }

        return [];
    }

    public function getIndex($identifier): int
    {
        $keys = $this->priortyMap->getKeys();

        return array_search($identifier, $keys, true);
    }
}
