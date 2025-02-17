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

use CoreShop\Bundle\ProductBundle\Pimcore\Repository\CategoryRepository as BaseCategoryRepository;
use CoreShop\Component\Core\Repository\CategoryRepositoryInterface;
use CoreShop\Component\Product\Model\CategoryInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use Doctrine\DBAL\ArrayParameterType;
use Pimcore\Model\DataObject\Listing;
use Pimcore\Model\DataObject\Listing\Concrete\Dao;

class CategoryRepository extends BaseCategoryRepository implements CategoryRepositoryInterface
{
    public function findForStore(StoreInterface $store): array
    {
        $list = $this->getList();
        $list->setCondition('stores LIKE ?', ['%,' . $store->getId() . ',%']);
        $this->setSortingForListingWithoutCategory($list);

        return $list->getObjects();
    }

    public function findFirstLevelForStore(StoreInterface $store): array
    {
        $list = $this->getList();
        $list->setCondition('parentCategory__id is null AND stores LIKE "%,' . $store->getId() . ',%"');

        $this->setSortingForListingWithoutCategory($list);

        return $list->getObjects();
    }

    public function findChildCategoriesForStore(CategoryInterface $category, StoreInterface $store): array
    {
        $list = $this->getList();
        $list->setCondition('parentCategory__id = ? AND stores LIKE "%,' . $store->getId() . ',%"', [$category->getId()]);

        $this->setSortingForListing($list, $category);

        return $list->getObjects();
    }

    public function findRecursiveChildCategoryIdsForStoreByCategories(array $categories, StoreInterface $store): array
    {
        $list = $this->getList();

        /**
         * @var Dao $dao
         */
        $dao = $list->getDao();

        /** @psalm-suppress InternalMethod */
        $query = '
            SELECT oo_id as id FROM (
                SELECT CONCAT(path, `key`) as realFullPath FROM objects WHERE id IN (:categories)
            ) as categories
            INNER JOIN ' . $dao->getTableName() . " variants ON variants.path LIKE CONCAT(categories.realFullPath, '/%')
        ";

        $params = [
            'categories' => $categories,
        ];
        $paramTypes = [
            'categories' => ArrayParameterType::STRING,
        ];

        $resultCategories = $this->connection->fetchAllAssociative($query, $params, $paramTypes);

        $childs = [];

        foreach ($categories as $categoryId) {
            $childs[$categoryId] = true;
        }

        foreach ($resultCategories as $result) {
            $childs[$result['id']] = true;
        }

        return array_keys($childs);
    }

    public function findRecursiveChildCategoryIdsForStore(CategoryInterface $category, StoreInterface $store): array
    {
        $list = $this->getList();

        /**
         * @var Dao $dao
         */
        $dao = $list->getDao();

        $qb = $this->connection->createQueryBuilder();
        /** @psalm-suppress InternalMethod */
        $qb
            ->select('oo_id')
            ->from($dao->getTableName())
            ->where('path LIKE :path')
            ->andWhere('stores LIKE :stores')
            ->setParameter('path', $category->getRealFullPath() . '/%')
            ->setParameter('stores', '%,' . $store->getId() . ',%')
        ;

        $childIds = [];

        $result = $this->connection->fetchAllAssociative($qb->getSQL(), $qb->getParameters());

        foreach ($result as $column) {
            $childIds[] = $column['oo_id'];
        }

        return $childIds;
    }

    public function findRecursiveChildCategoriesForStore(CategoryInterface $category, StoreInterface $store): array
    {
        $childIds = $this->findRecursiveChildCategoryIdsForStore($category, $store);

        if (empty($childIds)) {
            return [];
        }

        $list = $this->getList();
        $list->setCondition('oo_id IN (' . implode(',', $childIds) . ')');

        $this->setSortingForListing($list, $category);

        return $list->getObjects();
    }

    protected function setSortingForListing(Listing $list, CategoryInterface $category): void
    {
        if (method_exists($category, 'getChildrenSortBy')) {
            $list->setOrderKey(
                sprintf('`%s` ASC', $category->getChildrenSortBy()),
                false,
            );
        } else {
            $list->setOrderKey(
                '`key` ASC',
                false,
            );
        }
    }

    private function setSortingForListingWithoutCategory(Listing $list): void
    {
        $list->setOrderKey(
            '`index` ASC, `key` ASC',
            false,
        );
    }
}
