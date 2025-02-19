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

namespace CoreShop\Component\Product\Model;

use CoreShop\Component\Resource\Pimcore\Model\AbstractPimcoreModel;
use Pimcore\Model\DataObject\Listing;

abstract class Category extends AbstractPimcoreModel implements CategoryInterface
{
    public function getChildCategories(): Listing
    {
        return $this->getChildren();
    }

    public function hasChildCategories(): bool
    {
        return $this->getChildren()->getTotalCount() > 0;
    }

    public function getNameForSlug(?string $language = null): ?string
    {
        return $this->getName($language);
    }

    public function getHierarchy(): array
    {
        $hierarchy = [];

        $category = $this;

        do {
            $hierarchy[] = $category;

            $category = $category->getParent();
        } while ($category instanceof self);

        /**
         * @var CategoryInterface[] $hierarchy
         */
        $hierarchy = array_reverse($hierarchy);

        return $hierarchy;
    }
}
