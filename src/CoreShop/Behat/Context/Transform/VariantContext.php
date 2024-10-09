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

namespace CoreShop\Behat\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use CoreShop\Component\Variant\Model\AttributeColorInterface;
use CoreShop\Component\Variant\Model\AttributeGroupInterface;
use CoreShop\Component\Variant\Model\AttributeValueInterface;
use Webmozart\Assert\Assert;

final class VariantContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private RepositoryInterface $attributeGroupRepository,
        private RepositoryInterface $attributeColorRepository,
        private RepositoryInterface $attributeValueRepository,
    ) {
    }

    /**
     * @Transform /^attribute group "([^"]+)"$/
     */
    public function getAttributeGroup($name): AttributeGroupInterface
    {
        /**
         * @var AttributeGroupInterface[] $attributeGroups
         */
        $attributeGroups = $this->attributeGroupRepository->findBy(['name' => $name]);

        Assert::eq(
            count($attributeGroups),
            1,
            sprintf('%d Attribute Group has been found with name "%s".', count($attributeGroups), $name),
        );

        return reset($attributeGroups);
    }

    /**
     * @Transform /^attribute color "([^"]+)"$/
     */
    public function getAttributeColor($name): AttributeColorInterface
    {
        /**
         * @var AttributeColorInterface[] $attributes
         */
        $attributes = $this->attributeColorRepository->findBy(['name' => $name]);

        Assert::eq(
            count($attributes),
            1,
            sprintf('%d Attribute Color has been found with name "%s".', count($attributes), $name),
        );

        return reset($attributes);
    }

    /**
     * @Transform /^attribute value "([^"]+)"$/
     */
    public function getAttributeValue($name): AttributeValueInterface
    {
        /**
         * @var AttributeValueInterface[] $attributes
         */
        $attributes = $this->attributeValueRepository->findBy(['name' => $name]);

        Assert::eq(
            count($attributes),
            1,
            sprintf('%d Attribute Value has been found with name "%s".', count($attributes), $name),
        );

        return reset($attributes);
    }

    /**
     * @Transform /^attribute group/
     */
    public function attributeGroup()
    {
        return $this->sharedStorage->get('attribute-group');
    }
}
