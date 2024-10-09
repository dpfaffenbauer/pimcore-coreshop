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

namespace CoreShop\Behat\Page\Frontend;

use Behat\Mink\Exception\ElementNotFoundException;
use CoreShop\Bundle\TestBundle\Page\Frontend\FrontendPageInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\Variant\Model\AttributeInterface;

interface ProductPageInterface extends FrontendPageInterface
{
    public function getContent(): string;

    public function getName(): string;

    public function getPrice(): string;

    public function getPriceForUnit(string $unitName): string;

    public function getOriginalPrice(): string;

    public function getDiscount(): string;

    public function getTaxRate(): string;

    public function getTax(): string;

    public function getIsOutOfStock(): bool;

    public function getQuantityPriceRules(): array;

    public function getQuantityPriceRulesForUnit(ProductUnitInterface $unit): array;

    /**
     * @throws ElementNotFoundException
     */
    public function addToCart(): void;

    /**
     * @throws ElementNotFoundException
     */
    public function addToWishlist(): void;

    /**
     * @throws ElementNotFoundException
     */
    public function addToCartWithQuantity(string $quantity): void;

    /**
     * @throws ElementNotFoundException
     */
    public function addToCartInUnit(ProductUnitDefinitionInterface $unit): void;

    /**
     * @throws ElementNotFoundException
     */
    public function addToCartInUnitWithQuantity(ProductUnitDefinitionInterface $unit, string $quantity): void;

    public function clickAttribute(AttributeInterface $attribute): void;

    public function isAttributeSelected(AttributeInterface $attribute): bool;

    public function isAttributeDisabled(AttributeInterface $attribute): bool;

    public function isAttributeEnabled(AttributeInterface $attribute): bool;
}
