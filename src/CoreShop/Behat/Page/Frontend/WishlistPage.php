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

class WishlistPage extends AbstractFrontendPage implements WishlistPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_wishlist_summary';
    }

    public function isEmpty(): bool
    {
        return str_contains($this->getElement('wishlist_empty')->getText(), 'Your wishlist is empty');
    }

    public function hasItemNamed(string $name): bool
    {
        return $this->hasItemWith($name, '[data-test-wishlist-item-name]');
    }

    public function removeProduct(string $productName): void
    {
        $this->getElement('delete_button', ['%name%' => $productName])->press();
    }

    /**
     * @throws ElementNotFoundException
     */
    private function hasItemWith(string $attributeName, string|array $selector): bool
    {
        $itemsAttributes = $this->getElement('wishlist_items')->findAll('css', $selector);

        foreach ($itemsAttributes as $itemAttribute) {
            if ($attributeName === $itemAttribute->getText()) {
                return true;
            }
        }

        return false;
    }

    public function hasShareWishlistLink(): bool
    {
        $this->getElement('share_wishlist_link');

        return true;
    }

    public function getShareWishlistLink(): string
    {
        return $this->getElement('share_wishlist_link')->getValue();
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'wishlist_empty' => '[data-test-wishlist-empty]',
            'share_wishlist_link' => '[data-test-share-wishlist-link]',
            'wishlist_items' => '[data-test-wishlist-items]',
            'delete_button' => '[data-test-wishlist-remove-button="%name%"]',
        ]);
    }
}
