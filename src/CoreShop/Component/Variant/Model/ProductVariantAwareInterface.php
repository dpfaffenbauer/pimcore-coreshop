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

namespace CoreShop\Component\Variant\Model;

use CoreShop\Component\Resource\Pimcore\Model\PimcoreModelInterface;
use Pimcore\Model\DataObject\Concrete;

interface ProductVariantAwareInterface extends PimcoreModelInterface
{
    public function getName(?string $language = null): ?string;

    public function setName(?string $name, ?string $language = null);

    /**
     * @return AttributeInterface[]|null
     */
    public function getAttributes(): ?array;

    public function setAttributes(array $attributes);

    /**
     * @return AttributeGroupInterface[]|null
     */
    public function getAllowedAttributeGroups(): ?array;

    public function setAllowedAttributeGroups(array $allowedGroups);

    public function findAttributeForGroup(AttributeGroupInterface $attributeGroup): ?AttributeInterface;

    public function findMainVariant(): ?self;

    public function getMainVariant(): ?Concrete;

    public function setMainVariant(?Concrete $purchasable);

    public function getVariantParent();

    public function getVariants(): array;
}
