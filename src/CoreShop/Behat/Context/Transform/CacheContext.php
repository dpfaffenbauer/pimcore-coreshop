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

namespace CoreShop\Behat\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Cache;

final class CacheContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Transform /^cache item "([^"]+)"$/
     */
    public function cacheItemByKey($key): mixed
    {
        return Cache::getHandler()->getItem($key);
    }

    /**
     * @Transform /^cache item$/
     */
    public function cacheItem(): mixed
    {
        return $this->sharedStorage->get('cache_item');
    }

    /**
     * @Transform /^cache object$/
     */
    public function cacheObject(): mixed
    {
        return $this->sharedStorage->get('cache_object');
    }
}
