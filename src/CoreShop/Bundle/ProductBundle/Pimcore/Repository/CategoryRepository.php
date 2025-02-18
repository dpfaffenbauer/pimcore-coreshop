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

namespace CoreShop\Bundle\ProductBundle\Pimcore\Repository;

use CoreShop\Bundle\ResourceBundle\Pimcore\PimcoreRepository;
use CoreShop\Component\Product\Model\CategoryInterface;
use CoreShop\Component\Product\Repository\CategoryRepositoryInterface;

class CategoryRepository extends PimcoreRepository implements CategoryRepositoryInterface
{
    public function findFirstLevel(): array
    {
        $list = $this->getList();
        $list->setCondition('parentCategory__id is null');

        return $list->getObjects();
    }

    public function findChildCategories(CategoryInterface $category): array
    {
        $list = $this->getList();
        $list->setCondition('parentCategory__id = ?', [$category->getId()]);

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

        return $list->getObjects();
    }
}
