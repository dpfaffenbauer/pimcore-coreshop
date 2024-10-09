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

use CoreShop\Bundle\TestBundle\Page\Frontend\FrontendPageInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;

interface CartPageInterface extends FrontendPageInterface
{
    public function isEmpty(): bool;

    public function isSingleItemOnPage(): bool;

    public function hasItemNamed(string $name): bool;

    public function hasProductInUnit(string $name, ProductUnitDefinitionInterface $unitDefinition): bool;

    public function getItemUnitPriceWithUnit(string $name, ProductUnitDefinitionInterface $unitDefinition): string;

    public function getItemUnitPrice(string $productName): string;

    public function getItemTotalPrice(string $productName): string;

    public function getItemTotalPriceWithUnit(string $name, ProductUnitDefinitionInterface $unitDefinition): string;

    public function getQuantity(string $productName): int;

    public function changeQuantity(string $productName, string $quantity): void;

    public function removeProduct(string $productName): void;

    public function applyVoucherCode(string $voucherCode): void;

    public function getTotal(): string;
}
