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

interface CategoryPageInterface extends FrontendPageInterface
{
    public function getRouteName(): string;

    public function getContent(): string;

    public function getProductsInCategory(): array;

    public function switchView(string $name): void;

    public function getProductsInCategoryGrid(): array;

    public function changeOrder(string $order): void;

    public function setSearchField(string $query): void;

    public function clickFilterSubmit(): void;

    public function iSelectFilterOption(string $name): void;

    public function getFilterLabel(): string;
}
