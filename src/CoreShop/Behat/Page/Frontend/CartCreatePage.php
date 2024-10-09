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

class CartCreatePage extends AbstractFrontendPage implements CartCreatePageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_cart_create_named';
    }

    public function createNamedCart(string $name): void
    {
        $this->getElement('cart_name')->setValue($name);
        $this->getElement('cart_create_button')->click();
    }

    public function checkValidationMessageFor(string $message): bool
    {
        $element = $this->getElement('cart_creation_success');
        $label = $element->getText();

        if (null === $label) {
            throw new ElementNotFoundException($this->getSession(), 'Validation message', 'css', '[data-test-flash-message="success"]');
        }

        return $message === $label;
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'cart_create_button' => '[data-test-cart-create-button]',
            'cart_name' => '[data-test-cart-name]',
            'cart_creation_success' => '[data-test-flash-message="success"]',
        ]);
    }
}
