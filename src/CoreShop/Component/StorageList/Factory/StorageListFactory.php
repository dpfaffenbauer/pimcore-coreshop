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

namespace CoreShop\Component\StorageList\Factory;

use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Resource\Pimcore\Model\AbstractPimcoreModel;
use CoreShop\Component\Resource\TokenGenerator\UniqueTokenGenerator;
use CoreShop\Component\StorageList\Model\NameableStorageListInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Model\TokenAwareStorageListInterface;

class StorageListFactory implements StorageListFactoryInterface
{
    public function __construct(
        private FactoryInterface $storageListFactory,
    ) {
    }

    public function createNew()
    {
        /**
         * @var StorageListInterface $storageList
         */
        $storageList = $this->storageListFactory->createNew();

        if ($storageList instanceof AbstractPimcoreModel) {
            $storageList->setKey(uniqid('wishlist', true));
            $storageList->setPublished(true);
        }

        if ($storageList instanceof TokenAwareStorageListInterface) {
            $tokenGenerator = new UniqueTokenGenerator();
            $storageList->setToken($tokenGenerator->generate(10));
        }

        return $storageList;
    }

    public function createNewNamed(string $name)
    {
        /**
         * @var StorageListInterface $storageList
         */
        $storageList = $this->createNew();

        if ($storageList instanceof NameableStorageListInterface) {
            $storageList->setName($name);
        }

        return $storageList;
    }
}
