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

namespace CoreShop\Bundle\CoreBundle\Doctrine\ORM;

use CoreShop\Bundle\ResourceBundle\Doctrine\ORM\EntityRepository;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\ProductStoreValuesInterface;
use CoreShop\Component\Core\Repository\ProductStoreValuesRepositoryInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use Pimcore\Model\DataObject\Concrete;

class ProductStoreValuesRepository extends EntityRepository implements ProductStoreValuesRepositoryInterface
{
    public function findForProduct(ProductInterface $product): array
    {
        if (!$product instanceof Concrete) {
            throw new \InvalidArgumentException('Product must be instance of ' . Concrete::class);
        }

        return $this->findForObject($product, 'storeValues');
    }

    public function findForProductAndStore(ProductInterface $product, StoreInterface $store): ?ProductStoreValuesInterface
    {
        if (!$product instanceof Concrete) {
            throw new \InvalidArgumentException('Product must be instance of ' . Concrete::class);
        }

        return $this->findForObjectAndStore($product, 'storeValues', $store);
    }

    public function findForObject(Concrete $product, string $fieldName): array
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.product = :product')
            ->andWhere('o.fieldName = :fieldName')
            ->setParameter('product', $product->getId())
            ->setParameter('fieldName', $fieldName)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findForObjectAndStore(
        Concrete $product,
        string $fieldName,
        StoreInterface $store,
    ): ?ProductStoreValuesInterface {
        return $this->createQueryBuilder('o')
            ->andWhere('o.product = :product')
            ->andWhere('o.fieldName = :fieldName')
            ->andWhere('o.store = :store')
            ->setParameter('product', $product->getId())
            ->setParameter('store', $store)
            ->setParameter('fieldName', $fieldName)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
