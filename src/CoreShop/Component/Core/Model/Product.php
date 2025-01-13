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

namespace CoreShop\Component\Core\Model;

use CoreShop\Component\Index\Model\IndexInterface;
use CoreShop\Component\Product\Model\Product as BaseProduct;
use CoreShop\Component\Variant\Model\ProductVariantTrait;

abstract class Product extends BaseProduct implements ProductInterface
{
    use ProductVariantTrait;

    public function getInventoryName(): ?string
    {
        return $this->getName();
    }

    public function isInStock(): bool
    {
        return 0 < $this->getOnHand();
    }

    public function getMetaTitle(?string $language = null): ?string
    {
        return $this->getPimcoreMetaTitle($language) ?: $this->getName($language);
    }

    public function getMetaDescription(?string $language = null): ?string
    {
        return $this->getPimcoreMetaDescription($language) ?: $this->getShortDescription($language);
    }

    public function getOGTitle(?string $language = null): ?string
    {
        return $this->getMetaTitle($language);
    }

    public function getOGDescription(?string $language = null): ?string
    {
        return $this->getMetaDescription($language);
    }

    public function getOGType(): ?string
    {
        return 'product';
    }

    public function getIndexableEnabled(IndexInterface $index): bool
    {
        return $this->getActive() && $this->getPublished();
    }

    public function getIndexable(IndexInterface $index): bool
    {
        return $this->getIndexableEnabled($index);
    }

    public function getIndexableName(IndexInterface $index, string $language): ?string
    {
        return $this->getName($language);
    }
}
