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

namespace CoreShop\Component\StorageList\Core\Context;

use CoreShop\Component\StorageList\Context\StorageListContextInterface;
use CoreShop\Component\StorageList\Core\Repository\CustomerAndStoreAwareRepositoryInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Resolver\StorageListResolverInterface;
use Webmozart\Assert\Assert;

class PimcoreListResolver implements StorageListResolverInterface
{
    public function __construct(
        protected CustomerAndStoreAwareRepositoryInterface $repository,
        protected StorageListContextInterface $storageListContext,
    )
    {
    }

    public function getStorageLists(array $context): array
    {
        Assert::keyExists($context, 'store');

        if (!isset($context['customer'])) {
            return [$this->storageListContext->getStorageList()];
        }

        $store = $context['store'];
        $customer = $context['customer'];

        return $this->repository->findNamedStorageLists($store, $customer);
    }

    public function findNamed(array $context, string $name): ?StorageListInterface
    {
        Assert::keyExists($context, 'store');

        if (!isset($context['customer'])) {
            return null;
        }

        $store = $context['store'];
        $customer = $context['customer'];

        return $this->repository->findLatestByStoreAndCustomer($store, $customer, $name);
    }
}