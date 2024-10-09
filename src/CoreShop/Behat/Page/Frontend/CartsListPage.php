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
use CoreShop\Bundle\TestBundle\Page\Frontend\AbstractFrontendPage;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;

class CartsListPage extends AbstractFrontendPage implements CartsListPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_cart_list';
    }

    public function namedCartIsSelected(string $name = 'default'): bool
    {
        return $this->getElement('cart', ['%name%' => $name])->isSelected();
    }

    public function getNamedCartTotal(string $name = 'default'): string
    {
        return $this->getElement('named-cart-total', ['%name%' => $name])->getText();
    }

    public function selectNamedCart(string $name = 'default'): void
    {
        $value = $this->getElement('cart', ['%name%' => $name])->getAttribute('value');

        $this->getElement('cart_select')->selectOption($value);
        $this->getElement('cart_select_button')->click();
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'cart' => '[data-test-cart="%name%"]',
            'named-cart-total' => '[data-test-named-cart="%name%"] [data-test-total]',
            'cart_select' => '[name="coreshop[list]"]',
            'cart_select_button' => '[data-test-cart-select-button]',
            'cart_delete_button' => '[data-test-cart-delete-button]',
        ]);
    }
}
