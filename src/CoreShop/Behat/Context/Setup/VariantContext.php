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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Variant\Model\AttributeColorInterface;
use CoreShop\Component\Variant\Model\AttributeGroupInterface;
use CoreShop\Component\Variant\Model\AttributeValueInterface;
use CoreShop\Component\Variant\Model\ProductVariantAwareInterface;
use Pimcore\File;
use Pimcore\Model\DataObject\Data\RgbaColor;
use Pimcore\Model\DataObject\Service;

final class VariantContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private FactoryInterface $attributeGroupFactory,
        private FactoryInterface $attributeColorFactory,
        private FactoryInterface $attributeValueFactory,
    ) {
    }

    /**
     * @Given /^the site has a attribute group "([^"]+)"$/
     */
    public function thereIsAAttributeGroup($name): void
    {
        /**
         * @var AttributeGroupInterface $attributeGroup
         */
        $attributeGroup = $this->attributeGroupFactory->createNew();

        $attributeGroup->setName($name);
        $attributeGroup->setParent(Service::createFolderByPath('/attributes'));
        $attributeGroup->setKey(File::getValidFilename($name));
        $attributeGroup->setPublished(true);
        $attributeGroup->save();

        $this->sharedStorage->set('attribute-group', $attributeGroup);
    }

    /**
     * @Given /^the site has a color attribute "([^"]+)" with hex code "([^"]+)" in (attribute group "[^"]+")$/
     * @Given /^the site has a color attribute "([^"]+)" with hex code "([^"]+)" in (attribute group "[^"]+") with sorting (\d+)$/
     * @Given /^the site has a color attribute "([^"]+)" with hex code "([^"]+)" in (attribute group)$/
     * @Given /^the site has a color attribute "([^"]+)" with hex code "([^"]+)" in (attribute group) with sorting (\d+)$/
     */
    public function thereIsAColorAttributeInGroup(string $name, string $hex, AttributeGroupInterface $group, float $sorting = 0): void
    {
        /**
         * @var AttributeColorInterface $attribute
         */
        $attribute = $this->attributeColorFactory->createNew();

        $attribute->setName($name);
        $attribute->setValueText($name);
        $attribute->setValueColor($this->hex2rgba($hex));
        $attribute->setSorting($sorting);
        $attribute->setParent($group);
        $attribute->setKey(File::getValidFilename($name));
        $attribute->setPublished(true);
        $attribute->save();

        $this->sharedStorage->set('attribute', $attribute);
    }

    /**
     * @Given /^the site has a value attribute "([^"]+)" in (attribute group "[^"]+")$/
     * @Given /^the site has a value attribute "([^"]+)" in (attribute group "[^"]+") with sorting (\d+)$/
     * @Given /^the site has a value attribute "([^"]+)" in (attribute group)$/
     * @Given /^the site has a value attribute "([^"]+)" in (attribute group) with sorting (\d+)$/
     */
    public function thereIsAValueAttributeInGroup(string $name, AttributeGroupInterface $group, float $sorting = 1): void
    {
        /**
         * @var AttributeValueInterface $attribute
         */
        $attribute = $this->attributeValueFactory->createNew();

        $attribute->setName($name);
        $attribute->setValueText($name);
        $attribute->setSorting($sorting);
        $attribute->setParent($group);
        $attribute->setKey(File::getValidFilename($name));
        $attribute->setPublished(true);
        $attribute->save();

        $this->sharedStorage->set('attribute', $attribute);
    }

    /**
     * @Given /^the (product "[^"]+") is allowed (attribute group "[^"]+")$/
     * @Given /^the (product) is allowed (attribute group "[^"]+")$/
     */
    public function theProductIsAllowedAttributeGroup(
        ProductVariantAwareInterface $product,
        AttributeGroupInterface $group,
    ): void {
        $groups = $product->getAllowedAttributeGroups() ?? [];

        $groups[] = $group;

        $product->setAllowedAttributeGroups($groups);
        $product->save();
    }

    /**
     * @Given /^the (variant "[^"]+") uses (attribute color "[^"]+")$/
     * @Given /^the (variant) uses (attribute color "[^"]+")$/
     */
    public function theVariantUsesAttributeColor(
        ProductVariantAwareInterface $product,
        AttributeColorInterface $attributeColor,
    ): void {
        $attributes = $product->getAttributes() ?? [];

        $attributes[] = $attributeColor;

        $product->setAttributes($attributes);
        $product->save();
    }

    /**
     * @Given /^the (variant "[^"]+") uses (attribute value "[^"]+")$/
     * @Given /^the (variant) uses (attribute value "[^"]+")$/
     */
    public function theVariantUsesAttributeValue(
        ProductVariantAwareInterface $product,
        AttributeValueInterface $attributeValue,
    ): void {
        $attributes = $product->getAttributes() ?? [];

        $attributes[] = $attributeValue;

        $product->setAttributes($attributes);
        $product->save();
    }

    /**
     * @Given /^the (variant "[^"]+") uses (attribute color "[^"]+") and (attribute value "[^"]+")$/
     * @Given /^the (variant) uses (attribute color "[^"]+") and (attribute value "[^"]+")$/
     */
    public function theVariantUsesAttributeColorAndAttributeValue(
        ProductVariantAwareInterface $product,
        AttributeColorInterface $attributeColor,
        AttributeValueInterface $attributeValue,
    ): void {
        $attributes = $product->getAttributes() ?? [];

        $attributes[] = $attributeColor;
        $attributes[] = $attributeValue;

        $product->setAttributes($attributes);
        $product->save();
    }

    private function hex2rgba(string $color): RgbaColor
    {
        // Sanitize $color if "#" is provided
        if ($color[0] === '#') {
            $color = substr($color, 1);
        }

        // Check if color has 6 or 3 characters and get values
        if (strlen($color) === 6) {
            $hex = [$color[0] . $color[1], $color[2] . $color[3], $color[4] . $color[5]];
        } elseif (strlen($color) === 3) {
            $hex = [$color[0] . $color[0], $color[1] . $color[1], $color[2] . $color[2]];
        } else {
            return new RgbaColor(0, 0, 0, 0);
        }

        // Convert hexadec to rgb
        $rgb = array_map('hexdec', $hex);

        return new RgbaColor($rgb[0], $rgb[1], $rgb[2]);
    }
}
