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

namespace CoreShop\Component\Variant\Model\Resolved;

use CoreShop\Component\Variant\Model\AttributeInterface;
use CoreShop\Component\Variant\Model\ProductVariantAwareInterface;
use Doctrine\Common\Collections\ArrayCollection;

class ResolvedAttribute
{
    private AttributeInterface $attribute;

    private ArrayCollection $products;

    public function __construct(
        ?AttributeInterface $attribute = null,
    ) {
        $this->products = new ArrayCollection();
        if ($attribute) {
            $this->setAttribute($attribute);
        }
    }

    public function getAttribute(): AttributeInterface
    {
        return $this->attribute;
    }

    public function setAttribute(AttributeInterface $attribute): void
    {
        $this->attribute = $attribute;
    }

    public function getProducts(): array
    {
        return $this->products->toArray();
    }

    public function setProducts(array $products): void
    {
        $this->products = new ArrayCollection($products);
    }

    public function addProduct(ProductVariantAwareInterface $product): void
    {
        if (!$this->hasProduct($product)) {
            $this->products->add($product);
        }
    }

    public function removeProduct(ProductVariantAwareInterface $product): void
    {
        if ($this->hasProduct($product)) {
            $this->products->removeElement($product);
        }
    }

    public function hasProduct(ProductVariantAwareInterface $product): bool
    {
        /**
         * @psalm-suppress InvalidArgument
         */
        return $this->products->contains($product);
    }
}
