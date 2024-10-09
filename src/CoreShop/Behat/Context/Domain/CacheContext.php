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

namespace CoreShop\Behat\Context\Domain;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use Pimcore\Model\DataObject\Concrete;
use Symfony\Component\Cache\CacheItem;
use Webmozart\Assert\Assert;

final class CacheContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Then /^the (cache item) should be a DataObject$/
     */
    public function theCacheItemShouldBeADataObject(CacheItem $cacheItem): void
    {
        Assert::true($cacheItem->get() instanceof Concrete);
    }

    /**
     * @Then /^the (cache item) should have an object-var "([^"]+)" with value "([^"]+)"/
     * @Then /^the (cache item) should have an object-var "([^"]+)" with value of (tax rule group)/
     */
    public function theCacheItemShouldHaveAObjectVarWithValue(CacheItem $cacheItem, string $property, mixed $value): void
    {
        Assert::true($cacheItem->get() instanceof Concrete);
        /**
         * @var Concrete $item
         */
        $item = $cacheItem->get();
        $objectValue = $item->getObjectVar($property);

        if ($value instanceof ResourceInterface) {
            $value = $value->getId();
        }

        Assert::same((string) $objectValue, (string) $value);
    }

    /**
     * @Then /^the (cache object) should have an object-var "([^"]+)" of type ResourceInterface/
     */
    public function theCacheItemShouldHaveAObjectVarOfTypeResource(Concrete $cacheObject, string $property): void
    {
        $objectValue = $cacheObject->getObjectVar($property);

        Assert::isInstanceOf($objectValue, ResourceInterface::class);
    }

    /**
     * @Then /^the (cache item) serialized should have a property "([^"]+)" with value "([^"]+)"/
     * @Then /^the (cache item) serialized should have a property "([^"]+)" with value of (tax rule group)/
     */
    public function theCacheItemSerializedShouldLookLikeTheKnownOne(CacheItem $cacheItem, string $property, mixed $value): void
    {
        $itemData = $cacheItem->get();
        if (!is_scalar($itemData)) {
            $itemData = serialize($itemData);
        }

        $serializedNull = unserialize($itemData, ['allowed_classes' => false]);

        $convertToStdClass = static function (\__PHP_Incomplete_Class $object) {
            $dump = serialize($object);
            $dump = preg_replace('/^O:\d+:"[^"]++"/', 'O:8:"stdClass"', $dump);
            $dump = preg_replace_callback(
                '/:\d+:"\0.*?\0([^"]+)"/',
                static fn ($matches) => ':' . strlen($matches[1]) . ':"' . $matches[1] . '"',
                $dump,
            );

            return unserialize($dump);
        };

        $stdClass = $convertToStdClass($serializedNull);

        $cacheValue = $stdClass->{$property};

        if ($value instanceof ResourceInterface) {
            $value = $value->getId();
        }

        Assert::same((string) $cacheValue, (string) $value);
    }
}
