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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Cache;
use Pimcore\Model\DataObject\Concrete;
use Webmozart\Assert\Assert;

final class CacheContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Given /^the (product "[^"]+") is cached with key "([^"]+)"$/
     */
    public function iCacheObjectWithKey(mixed $object, string $key): void
    {
        if ($object instanceof Concrete) {
            Cache::getHandler()->removeClearedTags(['object_' . $object->getId()]);
            Cache::getHandler()->removeClearedTags(['class_' . $object->getClassId()]);
        }

        Assert::true(Cache::getHandler()->save($key, $object, ['behat'], null, 0, true));

        $this->sharedStorage->set('cache_key', $key);
    }

    /**
     * @Given /^I restore the object from the cache$/
     */
    public function iRestoreTheObjectFromTheCache(): void
    {
        $cacheItem = Cache::getHandler()->getItem($this->sharedStorage->get('cache_key'));

        Assert::true($cacheItem->isHit());

        $this->sharedStorage->set('cache_item', $cacheItem);
    }

    /**
     * @Given /^I restore the object with Pimcore Cache Helper/
     */
    public function iRestoreTheObjectWithPimcoreCacheHelper(): void
    {
        $obj = Cache::getHandler()->load($this->sharedStorage->get('cache_key'));
        $this->sharedStorage->set('cache_object', $obj);
    }
}
