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

namespace CoreShop\Component\Core\Repository;

use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\ProductStoreValuesInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use Pimcore\Model\DataObject\Concrete;

interface ProductStoreValuesRepositoryInterface extends RepositoryInterface
{
    /**
     * @return ProductStoreValuesInterface[]
     */
    public function findForProduct(ProductInterface $product): array;

    public function findForProductAndStore(ProductInterface $product, StoreInterface $store): ?ProductStoreValuesInterface;

    /**
     * @return ProductStoreValuesInterface[]
     */
    public function findForObject(Concrete $product, string $fieldName): array;

    public function findForObjectAndStore(Concrete $product, string $fieldName, StoreInterface $store): ?ProductStoreValuesInterface;
}
