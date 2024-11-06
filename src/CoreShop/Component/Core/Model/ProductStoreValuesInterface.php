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

use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Store\Model\StoreAwareInterface;
use Doctrine\Common\Collections\Collection;

interface ProductStoreValuesInterface extends ResourceInterface, StoreAwareInterface
{
    /**
     * @return string
     */
    public function getFieldName();

    public function setFieldName(string $fieldName);

    /**
     * @return int
     */
    public function getPrice();

    public function setPrice(int $price);

    /**
     * @return ProductInterface
     */
    public function getProduct();

    public function setProduct(ProductInterface $product);

    public function addProductUnitDefinitionPrice(ProductUnitDefinitionPriceInterface $productUnitDefinitionPrice);

    public function removeProductUnitDefinitionPrice(ProductUnitDefinitionPriceInterface $productUnitDefinitionPrice);

    /**
     * @return Collection<int, ProductUnitDefinitionPriceInterface>|ProductUnitDefinitionPriceInterface[]
     */
    public function getProductUnitDefinitionPrices();
}
