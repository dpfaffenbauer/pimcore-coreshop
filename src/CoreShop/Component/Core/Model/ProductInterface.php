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

use CoreShop\Component\Index\Model\IndexableInterface;
use CoreShop\Component\Inventory\Model\StockableInterface;
use CoreShop\Component\Order\Model\PurchasableInterface;
use CoreShop\Component\Product\Model\ProductInterface as BaseProductInterface;
use CoreShop\Component\ProductQuantityPriceRules\Model\QuantityRangePriceAwareInterface;
use CoreShop\Component\SEO\Model\PimcoreSEOAwareInterface;
use CoreShop\Component\SEO\Model\SEOImageAwareInterface;
use CoreShop\Component\SEO\Model\SEOOpenGraphAwareInterface;
use CoreShop\Component\Taxation\Model\TaxRuleGroupInterface;
use CoreShop\Component\Variant\Model\ProductVariantAwareInterface;
use CoreShop\Component\Wishlist\Model\WishlistProductInterface;

interface ProductInterface extends
    BaseProductInterface,
    IndexableInterface,
    PurchasableInterface,
    StockableInterface,
    PimcoreSEOAwareInterface,
    SEOImageAwareInterface,
    SEOOpenGraphAwareInterface,
    QuantityRangePriceAwareInterface,
    PimcoreStoresAwareInterface,
    ProductVariantAwareInterface,
    WishlistProductInterface
{
    /**
     * @return \CoreShop\Component\Core\Model\ProductStoreValuesInterface[]
     */
    public function getStoreValues(): array;

    public function setStoreValues(array $storeValues): self;

    public function getStoreValuesForStore(\CoreShop\Component\Store\Model\StoreInterface $store): ?\CoreShop\Component\Core\Model\ProductStoreValuesInterface;

    public function setStoreValuesForStore(ProductStoreValuesInterface $storeValues, \CoreShop\Component\Store\Model\StoreInterface $store): self;

    public function getStoreValuesOfType(string $type, \CoreShop\Component\Store\Model\StoreInterface $store);

    public function setStoreValuesOfType(string $type, $value, \CoreShop\Component\Store\Model\StoreInterface $store): self;

    public function getDigitalProduct(): ?bool;

    public function setDigitalProduct(?bool $digitalProduct);

    public function getMinimumQuantityToOrder(): ?int;

    public function setMinimumQuantityToOrder(?int $minimumQuantity);

    public function getMaximumQuantityToOrder(): ?int;

    public function setMaximumQuantityToOrder(?int $maximumQuantity);
}
