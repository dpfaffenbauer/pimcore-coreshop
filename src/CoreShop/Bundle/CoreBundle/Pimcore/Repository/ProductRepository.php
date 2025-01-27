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

namespace CoreShop\Bundle\CoreBundle\Pimcore\Repository;

use CoreShop\Bundle\ProductBundle\Pimcore\Repository\ProductRepository as BaseProductRepository;
use CoreShop\Component\Core\Model\CategoryInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Repository\ProductRepositoryInterface;
use CoreShop\Component\Core\Repository\ProductVariantRepositoryInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use Doctrine\DBAL\ArrayParameterType;
use Pimcore\Cache;
use Pimcore\Model\DataObject\AbstractObject;
use Pimcore\Model\DataObject\Listing;
use Pimcore\Model\DataObject\Listing\Concrete\Dao;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProductRepository extends BaseProductRepository implements ProductRepositoryInterface, ProductVariantRepositoryInterface
{
    public const VARIANT_RECURSIVE_QUERY_CACHE_TAG = 'coreshop_variant_recursive';

    public function findLatestByStore(StoreInterface $store, int $count = 8): array
    {
        $conditions = [
            ['condition' => 'active = ?', 'variable' => 1],
            ['condition' => 'stores LIKE ?', 'variable' => '%,' . $store->getId() . ',%'],
        ];

        /** @psalm-suppress InvalidArgument */
        return $this->findBy($conditions, ['creationDate' => 'DESC'], $count);
    }

    public function findAllVariants(ProductInterface $product, bool $recursive = true): array
    {
        $list = $this->getList();
        $list->setObjectTypes([AbstractObject::OBJECT_TYPE_VARIANT]);

        if ($recursive) {
            $list->setCondition('path LIKE ?', [$product->getRealFullPath() . '/%']);
        } else {
            $list->setCondition('parentId = ?', [$product->getId()]);
        }

        return $list->getObjects();
    }

    public function findRecursiveVariantIdsForProductAndStoreByProducts(array $products, StoreInterface $store, array $cacheTags = []): array
    {
        $cacheKey = sprintf('cs_rvids_%s_%d', md5(implode('-', $products)), $store->getId());

        if (false === $variantIds = Cache::load($cacheKey)) {
            $list = $this->getList();

            /**
             * @var Dao $dao
             */
            $dao = $list->getDao();

            /** @psalm-suppress InternalMethod */
            $query = '
            SELECT oo_id as id FROM (
                SELECT CONCAT(path, `key`) as realFullPath FROM objects WHERE id IN (:products)
            ) as products
            INNER JOIN ' . $dao->getTableName() . " variants ON variants.path LIKE CONCAT(products.realFullPath, '/%')
            WHERE variants.stores LIKE :store
        ";

            $params = [
                'products' => $products,
                'store' => '%,' . $store->getId() . ',%',
            ];
            $paramTypes = [
                'products' => ArrayParameterType::STRING,
            ];

            $resultProducts = $this->connection->fetchAllAssociative($query, $params, $paramTypes);

            $variantIds = [];

            foreach ($products as $productId) {
                $variantIds[$productId] = true;
            }

            foreach ($resultProducts as $result) {
                $variantIds[$result['id']] = true;
            }

            $cacheTags[] = self::VARIANT_RECURSIVE_QUERY_CACHE_TAG;

            Cache::save($variantIds, $cacheKey, $cacheTags, 500, 0, true);
        }

        return array_keys($variantIds);
    }

    public function findRecursiveVariantIdsForProductAndStore(ProductInterface $product, StoreInterface $store): array
    {
        $list = $this->getList();

        /**
         * @var Dao $dao
         */
        $dao = $list->getDao();

        /** @psalm-suppress InternalMethod */
        $query = $this->connection->createQueryBuilder()
            ->select()
            ->from($dao->getTableName())
            ->select('oo_id')
            ->where('path LIKE :path')
            ->andWhere('stores LIKE :stores')
            ->andWhere('type = :variant')
            ->setParameter('path', $product->getRealFullPath() . '/%')
            ->setParameter('stores', '%,' . $store->getId() . ',%')
            ->setParameter('variant', 'variant')
        ;

        $variantIds = [];

        $result = $this->connection->fetchAllAssociative($query->getSQL(), $query->getParameters());

        foreach ($result as $column) {
            $variantIds[] = $column['oo_id'];
        }

        return $variantIds;
    }

    public function getProducts(array $options = []): array
    {
        $list = $this->getProductsListing($options);

        /**
         * @var ProductInterface[] $products
         */
        $products = $list->load();

        return $products;
    }

    public function getProductsListing(array $options = []): Listing
    {
        $resolver = new OptionsResolver();
        $resolver->setDefaults([
            'only_active' => true,
            'categories' => [],
            'store' => null,
            'order_key' => 'name',
            'order' => 'ASC',
            'order_key_quote' => true,
            'object_types' => null,
            'return_type' => 'objects',
        ]);

        $resolver->setRequired(['store']);
        $resolver->setAllowedTypes('only_active', 'bool');
        $resolver->setAllowedTypes('categories', 'array');
        $resolver->setAllowedTypes('store', ['null', StoreInterface::class]);
        $resolver->setAllowedTypes('order_key', 'string');
        $resolver->setAllowedTypes('order_key_quote', 'bool');
        $resolver->setAllowedTypes('order', 'string');
        $resolver->setAllowedTypes('object_types', ['null', 'array']);
        $resolver->setAllowedValues('object_types', function (?array $value) {
            $valid = [
                null,
                AbstractObject::OBJECT_TYPE_FOLDER,
                AbstractObject::OBJECT_TYPE_OBJECT,
                AbstractObject::OBJECT_TYPE_VARIANT,
            ];

            return $value === null || !array_diff($value, $valid);
        });

        $listOptions = $resolver->resolve($options);

        $list = $this->getList();

        if ($listOptions['object_types'] !== null) {
            $list->setObjectTypes($listOptions['object_types']);
        }

        if ($listOptions['only_active'] === true) {
            $list->addConditionParam('active = ?', 1);
        }

        $classId = $this->getClassId();
        if (count($listOptions['categories']) > 0) {
            $categoryIds = [];
            foreach ($listOptions['categories'] as $category) {
                if ($category instanceof CategoryInterface) {
                    $categoryIds[] = $category->getId();
                }
            }
            if (count($categoryIds) > 0) {
                $list->addConditionParam('(id IN (SELECT DISTINCT src_id FROM object_relations_' . $classId . ' WHERE fieldname = "categories" AND dest_id IN (' . implode(',', $categoryIds) . ')))');
            }
        }

        if ($listOptions['store'] instanceof StoreInterface) {
            $list->addConditionParam('stores LIKE ?', '%,' . $listOptions['store']->getId() . ',%');
        }

        $list->setOrderKey($listOptions['order_key'], $listOptions['order_key_quote']);
        $list->setOrder($listOptions['order']);

        return $list;
    }
}
