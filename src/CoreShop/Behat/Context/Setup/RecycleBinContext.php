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
use CoreShop\Component\Core\Model\ProductInterface;
use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\Element\Recyclebin\Item;
use Webmozart\Assert\Assert;

final class RecycleBinContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Then /^I recycle the (product "[^"]+")$/
     * @Then /^I recycle the (product)$/
     */
    public function IAddTheObjectToTheBin(Concrete $concrete): void
    {
        /**
         * @var Item $item
         */
        $item = new Item();
        $item->setElement($concrete);
        $item->save();

        $concrete->delete();

        $this->sharedStorage->set(
            'data_object_recycle_' . $concrete->getId(),
            $item->getId(),
        );
    }

    /**
     * @Then /^I restore the recycled (product "[^"]+")$/
     * @Then /^I restore the recycled (product)$/
     */
    public function iRestoreTheRecycledProduct(Concrete $concrete): void
    {
        $key = 'data_object_recycle_' . $concrete->getId();

        /**
         * @var Item $item
         */
        $item = Item::getById($this->sharedStorage->get($key));

        Assert::isInstanceOf($item, Item::class);

        $item->restore();

        $product = DataObject::getById($concrete->getId(), ['force' => true]);

        Assert::isInstanceOf($product, ProductInterface::class);

        //Force reload of restored product
        $this->sharedStorage->set('product', $product);
    }
}
