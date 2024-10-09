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
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Variant\Model\AttributeGroupInterface;
use Pimcore\Model\DataObject\AbstractObject;
use Webmozart\Assert\Assert;

final class VariantContext implements Context
{
    public function __construct(
        protected SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Then /^the (attribute group "[^"]+") should have (\d+) attributes$/
     */
    public function theAttributeGroupShouldHaveXAttributes(AttributeGroupInterface $attributeGroup, int $count): void
    {
        Assert::eq(
            count($attributeGroup->getChildren([AbstractObject::OBJECT_TYPE_OBJECT])),
            $count,
            sprintf(
                '%d attributes have been found in group "%s".',
                count($attributeGroup->getChildren([AbstractObject::OBJECT_TYPE_OBJECT])),
                $attributeGroup->getRealFullPath(),
            ),
        );
    }

    /**
     * @Then /^the (product "[^"]+") should have (\d+) variants$/
     * @Then /^the (product) should have (\d+) variants$/
     */
    public function theProductShouldHaveVariants(ProductInterface $product, int $count): void
    {
        Assert::eq(count($product->getChildren([AbstractObject::OBJECT_TYPE_VARIANT], true)), $count);
    }
}
