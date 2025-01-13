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

namespace CoreShop\Component\StorageList\Core\Storage;

use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Repository\StorageListRepositoryInterface;
use CoreShop\Component\StorageList\Storage\StorageListStorageInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Webmozart\Assert\Assert;

class SessionStorageListStorage implements StorageListStorageInterface
{
    public function __construct(
        private RequestStack $requestStack,
        private string $sessionKeyName,
        private StorageListRepositoryInterface $repository,
    ) {
    }

    public function hasForContext(array $context): bool
    {
        if (!$this->hasSession()) {
            return false;
        }

        return $this->getSession()->has($this->getKeyName($context));
    }

    public function getForContext(array $context): ?StorageListInterface
    {
        if (!$this->hasSession()) {
            return null;
        }

        if ($this->hasForContext($context)) {
            $storageListId = $this->getSession()->get($this->getKeyName($context));

            if (!is_int($storageListId)) {
                return null;
            }

            return $this->repository->findByStorageListId($storageListId);
        }

        return null;
    }

    public function setForContext(array $context, StorageListInterface $storageList): void
    {
        if (!$this->hasSession()) {
            throw new \InvalidArgumentException('Session is not available');
        }

        $this->getSession()->set($this->getKeyName($context), $storageList->getId());
    }

    public function removeForContext(array $context): void
    {
        $this->getSession()->remove($this->getKeyName($context));
    }

    private function getSession(): SessionInterface
    {
        return $this->requestStack->getSession();
    }

    private function hasSession(): bool
    {
        return $this->requestStack->getMainRequest()?->hasSession() ?: false;
    }

    private function getKeyName(array $context): string
    {
        Assert::keyExists($context, 'store');

        /**
         * @var StoreInterface $store
         */
        $store = $context['store'];

        return sprintf('%s.%s', $this->sessionKeyName, $store->getId());
    }
}
